const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 12000;

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL
  };
}

function buildSystemPrompt() {
  return `You are MedScout Assistant, a healthcare information and hospital-discovery assistant in India.

Use the LOCAL_ENGINE_RESPONSE as the authoritative source for every hospital name, price, outcome, distance, accreditation, scheme, and source claim. Rewrite it for clarity only. Do not add facts, numbers, diagnoses, doctors, facilities, or treatments that are not present in that response.

You may:
- Make the response warmer and easier to scan.
- Ask one high-value follow-up question if the local response includes one.
- Explain trade-offs using only the supplied facts.
- Give general health information only when it is already present in the local response.

You must:
- Never diagnose or imply a diagnosis.
- Never provide medication doses or personalized treatment instructions.
- Lead with urgent-care guidance if the local response is an emergency response.
- Preserve unavailable-data warnings and limitations.
- Keep source names, reporting periods, and numeric values unchanged.
- Return plain text or Markdown only, with no preamble about being an AI model.`;
}

function extractText(responseJson) {
  return responseJson?.choices?.[0]?.message?.content?.trim() || null;
}

export function isOpenAIConfigured() {
  return Boolean(getOpenAIConfig());
}

export function getAIStatus() {
  const config = getOpenAIConfig();
  return {
    provider: config ? "openai" : "local",
    model: config?.model || "local-deterministic-engine",
    configured: Boolean(config),
    fallbackAvailable: true
  };
}

export async function enhanceWithOpenAI({ message, localResponse }) {
  const config = getOpenAIConfig();
  if (!config || localResponse.isEmergency) return localResponse;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        max_tokens: 900,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          {
            role: "user",
            content: JSON.stringify({
              user_message: message,
              local_engine_response: {
                content: localResponse.content,
                resultCards: localResponse.resultCards || [],
                comparisonCards: localResponse.comparisonCards || [],
                schemeCards: localResponse.schemeCards || [],
                sources: localResponse.sources || [],
                followUpQuestion: localResponse.followUpQuestion || null
              }
            })
          }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.error(`[OpenAI] Request failed with status ${response.status}. Falling back to local response.`);
      return localResponse;
    }

    const text = extractText(await response.json());
    if (!text) return localResponse;

    return {
      ...localResponse,
      content: text,
      aiProvider: "openai",
      aiModel: config.model
    };
  } catch (error) {
    const reason = error.name === "AbortError" ? "timed out" : "was unavailable";
    console.error(`[OpenAI] Request ${reason}. Falling back to local response.`);
    return localResponse;
  } finally {
    clearTimeout(timeout);
  }
}
