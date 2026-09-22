import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ArrowRight,
  Stethoscope,
  Info,
  RotateCcw,
  Sliders,
  ExternalLink,
  Building2,
  TrendingUp,
  Award,
  Plus,
  Check,
  MapPin,
  IndianRupee,
  Layers
} from "lucide-react";

export default function AIChatbotDrawer({
  isOpen,
  onClose,
  onApplyExtractedFilters,
  onViewHospital,
  onQueueHospital
}) {
  // Session-scoped state (Requirement 10: Session-only memory)
  const [sessionState, setSessionState] = useState({
    context: {},
    preferences: {
      priorities: ["outcomes", "volume", "cost", "distance"],
      outcomePriority: "normal",
      volumePriority: "normal",
      distanceFlexibility: "normal",
      ownershipPreference: "any"
    },
    turnCount: 0
  });

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello. I am the MedScout Clinical Reasoning Assistant. I can help you find and compare hospitals for planned procedures grounded strictly in statutory registry evidence.

You can state your condition, location, budget, or explicit priorities (e.g., *"I care more about treatment success rate than distance"* or *"I prefer government hospitals"*).`,
      personalizationNote: null,
      extractedContext: null,
      resultCards: [],
      schemeCards: [],
      sources: []
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleResetMemory = () => {
    const emptyState = {
      context: {},
      preferences: {
        priorities: ["outcomes", "volume", "cost", "distance"],
        outcomePriority: "normal",
        volumePriority: "normal",
        distanceFlexibility: "normal",
        ownershipPreference: "any"
      },
      turnCount: 0
    };
    setSessionState(emptyState);
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: "🔄 **Session memory cleared.** Learned search parameters and priorities have been reset to default.",
        personalizationNote: null,
        resultCards: [],
        schemeCards: [],
        sources: []
      }
    ]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionState: sessionState
        })
      });
      const json = await res.json();

      if (json.success && json.data) {
        const botData = json.data;
        setMessages(prev => [...prev, botData]);

        // Accumulate session state across conversation turns (Requirement 3 & 4)
        if (botData.extractedContext) {
          const newContext = {
            ...(sessionState.context || {}),
            ...botData.extractedContext
          };
          const newPreferences = {
            ...(sessionState.preferences || {}),
            ...(botData.extractedContext.preferences || {})
          };
          // Remove nested preferences from context to keep clean
          delete newContext.preferences;

          setSessionState({
            context: newContext,
            preferences: newPreferences,
            turnCount: (sessionState.turnCount || 0) + 1
          });
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "Encountered an issue querying the clinical registry. Please rephrase or specify a condition.",
            resultCards: [],
            schemeCards: [],
            sources: []
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Error connecting to MedScout registry gateway. Please verify network connectivity.",
          resultCards: [],
          schemeCards: [],
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Active preferences count
  const activePrefsCount = [
    sessionState.context?.disease,
    sessionState.context?.location,
    sessionState.context?.budget,
    sessionState.preferences?.outcomePriority === "high" ? "Outcomes" : null,
    sessionState.preferences?.volumePriority === "high" ? "High Volume" : null,
    sessionState.preferences?.distanceFlexibility === "flexible" ? "Travel Flexible" : null,
    sessionState.preferences?.ownershipPreference !== "any" ? sessionState.preferences?.ownershipPreference : null
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[580px] bg-surface shadow-2xl flex flex-col border-l border-surface-container-high animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-on-surface text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-sm text-white">
                MedScout Clinical AI Assistant
              </h2>
              <span className="text-[10px] text-secondary bg-white/10 px-1.5 py-0.5 rounded font-mono">
                Adaptive Reasoning
              </span>
            </div>
            <p className="text-[11px] text-white/70">
              Grounded in verified institutional and MoHFW registry records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMemoryPanel(prev => !prev)}
            title="View Active Session Memory"
            className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              showMemoryPanel ? "bg-secondary text-white" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">{activePrefsCount}</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adaptive Session Memory Drawer/Bar (Requirement 1 & 10) */}
      {showMemoryPanel && (
        <div className="bg-surface-container-low border-b border-surface-container-high p-3.5 space-y-2.5 text-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-on-surface uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              Active Session Context & Learned Preferences
            </span>
            <button
              onClick={handleResetMemory}
              className="text-[10px] text-danger hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Memory
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {sessionState.context?.disease && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                Condition: {sessionState.context.disease}
              </span>
            )}
            {sessionState.context?.location && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                Location: {sessionState.context.location}
              </span>
            )}
            {sessionState.context?.budget && (
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface border border-surface-container-high font-medium">
                Budget: ≤ ₹{sessionState.context.budget.toLocaleString("en-IN")}
              </span>
            )}
            {sessionState.preferences?.outcomePriority === "high" && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                Priority: Outcomes &gt; Distance
              </span>
            )}
            {sessionState.preferences?.volumePriority === "high" && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                Priority: High Caseload Volume
              </span>
            )}
            {sessionState.preferences?.distanceFlexibility === "flexible" && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                Travel Radius: Expanded
              </span>
            )}
            {sessionState.preferences?.ownershipPreference === "government" && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                Ownership: Government / Public
              </span>
            )}
            {activePrefsCount === 0 && (
              <span className="text-tertiary italic text-[11px]">
                No specific constraints or priorities recorded yet. State your preferences naturally.
              </span>
            )}
          </div>

          <p className="text-[10px] text-tertiary">
            Preferences apply to this current browser session only and never modify underlying registry data.
          </p>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low/30">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {/* Main Message Bubble */}
            <div
              className={`max-w-[94%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : msg.isEmergency
                  ? "bg-red-50 text-danger border border-red-200 rounded-bl-none"
                  : "bg-white text-on-surface border border-surface-container-high rounded-bl-none"
              }`}
            >
              {/* Emergency Alert */}
              {msg.isEmergency && (
                <div className="flex items-center gap-2 text-danger font-bold text-xs uppercase mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Clinical Safety Alert</span>
                </div>
              )}

              {/* Personalization Explanation Banner (Requirement 8) */}
              {msg.personalizationNote && (
                <div className="mb-3 p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-secondary" />
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wider">
                      Personalized Ranking Active
                    </span>
                    <span className="text-on-surface-variant text-[11px]">
                      {msg.personalizationNote}
                    </span>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-line space-y-2">
                {msg.content}
              </div>

              {/* Result Cards Inline (Grounded Hospitals) */}
              {msg.resultCards && msg.resultCards.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-secondary uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Matching Verified Facilities ({msg.resultCards.length})
                    </span>
                    <span className="text-[10px] text-tertiary lowercase font-normal">
                      ranked by clinical evidence &amp; preferences
                    </span>
                  </div>

                  <div className="space-y-2">
                    {msg.resultCards.map((h, hIdx) => (
                      <div
                        key={hIdx}
                        className="bg-surface-container-low/70 rounded-xl p-3 border border-surface-container-high/80 hover:border-secondary/40 transition-all text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                                {hIdx + 1}
                              </span>
                              <h4 className="font-headline font-bold text-on-surface text-xs sm:text-sm">
                                {h.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-tertiary mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {h.location} • {h.distance} km
                              </span>
                              <span>•</span>
                              <span className="font-medium text-on-surface-variant">{h.ownership}</span>
                            </div>
                          </div>

                          {h.relevanceScore && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-secondary shrink-0">
                              {h.relevanceScore}% Fit
                            </span>
                          )}
                        </div>

                        {/* Ranking Rationale Badges */}
                        {h.rankingRationale && h.rankingRationale.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {h.rankingRationale.slice(0, 2).map((rat, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-1.5 py-0.5 rounded bg-white text-secondary font-medium border border-secondary/20 flex items-center gap-1"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                {rat}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-1.5 bg-white p-2 rounded-lg border border-surface-container-high/60 text-[10px]">
                          <div>
                            <span className="text-tertiary block text-[9px]">30-Day Mortality</span>
                            <span className="font-bold text-on-surface">
                              {h.outcome}
                            </span>
                          </div>
                          <div>
                            <span className="text-tertiary block text-[9px]">Annual Volume</span>
                            <span className="font-bold text-on-surface">
                              {h.volume}
                            </span>
                          </div>
                          <div>
                            <span className="text-tertiary block text-[9px]">Package Tariff</span>
                            <span className="font-bold text-primary truncate block">
                              {h.costRange}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {onQueueHospital && (
                            <button
                              onClick={() => onQueueHospital(h)}
                              className="flex-1 py-1 px-2.5 rounded-lg bg-white hover:bg-surface-container border border-surface-container-high text-on-surface font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-secondary" />
                              <span>Add to Compare</span>
                            </button>
                          )}
                          {onViewHospital && (
                            <button
                              onClick={() => onViewHospital(h)}
                              className="flex-1 py-1 px-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>View Dossier</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheme Cards Inline */}
              {msg.schemeCards && msg.schemeCards.length > 0 && (
                <div className="mt-3.5 space-y-2 border-t border-surface-container-high pt-2.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                    Verified Government Healthcare Schemes
                  </span>
                  {msg.schemeCards.map((sc, scIdx) => (
                    <div
                      key={scIdx}
                      className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-on-surface">{sc.name}</span>
                        <span className="text-[10px] text-secondary font-semibold bg-secondary-container px-1.5 py-0.5 rounded">
                          {sc.coverageLimit}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {sc.eligibilitySummary}
                      </p>
                      {sc.packageInfo && (
                        <p className="text-[11px] text-primary font-medium">
                          Package Reference: {sc.packageInfo}
                        </p>
                      )}
                      {sc.officialUrl && (
                        <a
                          href={sc.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-secondary hover:underline font-semibold pt-1"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Citations / Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-surface-container-high/60 flex flex-wrap items-center gap-1.5 text-[10px] text-tertiary">
                  <span className="font-semibold">Citations:</span>
                  {msg.sources.map((s, idx) => (
                    <span
                      key={idx}
                      title={`${s.publisher || ""} • ${s.period || ""}`}
                      className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant flex items-center gap-1"
                    >
                      <FileText className="w-2.5 h-2.5 text-secondary" />
                      {s.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Follow-up Question interactive pill (Requirement 3) */}
            {msg.followUpQuestion && (
              <div className="mt-2 max-w-[94%] ml-2">
                <button
                  onClick={() => handleSend(msg.followUpQuestion)}
                  className="px-3 py-1.5 rounded-xl bg-secondary-container/70 hover:bg-secondary-container text-secondary text-xs font-medium border border-secondary/30 flex items-center gap-1.5 transition-colors text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{msg.followUpQuestion}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-tertiary bg-white p-3 rounded-2xl w-fit border border-surface-container-high shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
            <span>Reasoning across statutory registry records &amp; adapting ranking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Fast Prompts Demonstrating Adaptive Learning */}
      <div className="px-4 py-2 bg-surface-container-low border-t border-surface-container-high flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
        <span className="text-tertiary font-semibold">Try:</span>
        <button
          onClick={() => handleSend("I care more about treatment success rate than distance.")}
          className="px-2.5 py-1 rounded-full bg-white border border-surface-container-high text-on-surface hover:bg-surface-container transition-colors"
        >
          Priority: Success Rate &gt; Distance
        </button>
        <button
          onClick={() => handleSend("I can go up to ₹1.5 lakh.")}
          className="px-2.5 py-1 rounded-full bg-white border border-surface-container-high text-on-surface hover:bg-surface-container transition-colors"
        >
          Update Budget to ₹1.5L
        </button>
        <button
          onClick={() => handleSend("I prefer government hospitals.")}
          className="px-2.5 py-1 rounded-full bg-white border border-surface-container-high text-on-surface hover:bg-surface-container transition-colors"
        >
          Government Hospitals
        </button>
        <button
          onClick={() => handleSend("I want hospitals that have treated many patients with this disease.")}
          className="px-2.5 py-1 rounded-full bg-white border border-surface-container-high text-on-surface hover:bg-surface-container transition-colors"
        >
          High Patient Volume
        </button>
        <button
          onClick={() => handleSend("How are hospitals ranked?")}
          className="px-2.5 py-1 rounded-full bg-white border border-surface-container-high text-on-surface hover:bg-surface-container transition-colors"
        >
          Ranking Methodology
        </button>
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-surface-container-high">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type condition, budget, or preferences (e.g. success rate > distance)..."
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-tertiary mt-2 text-center flex items-center justify-center gap-1">
          <Info className="w-3 h-3 text-secondary" />
          MedScout is an institutional information platform. Does not provide medical diagnoses.
        </p>
      </div>
    </div>
  );
}
