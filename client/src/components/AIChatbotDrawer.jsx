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
  Layers,
  Mic,
  MicOff,
  Paperclip
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AIChatbotDrawer({
  isOpen,
  onClose,
  initialPrompt,
  initialReport,
  onClearInitialPrompt,
  initialLocation,
  onApplyExtractedFilters,
  onViewHospital,
  onQueueHospital
}) {
  const { authFetch } = useAuth();
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
      content: "Hi — tell me what's going on: your condition or symptoms, where you're located, and your budget, and I'll find matching hospitals.",
      personalizationNote: null,
      extractedContext: null,
      resultCards: [],
      schemeCards: [],
      sources: []
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [attachedReport, setAttachedReport] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastExecutedPromptRef = useRef("");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setMessages(prev => [...prev, { role: "assistant", content: "Location access is not available in this browser. Tell me your city or area instead.", resultCards: [], schemeCards: [], sources: [] }]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const location = latitude > 28.2 && latitude < 30.2 && longitude > 76.5 && longitude < 78.5
          ? "New Delhi NCR"
          : latitude > 30.4 && latitude < 31.2 && longitude > 75.4 && longitude < 77.2
            ? "Chandigarh"
            : null;
        setSessionState(previous => ({
          ...previous,
          context: { ...previous.context, location: location || previous.context.location || "Current area", locationPermission: "granted" }
        }));
        setMessages(prev => [...prev, { role: "assistant", content: location ? `Thanks — I’ll use **${location}** as your search area. You can change it or say “forget my location” at any time.` : "Thanks — location access is on, but I could not map it to a supported search region. Please tell me your city or area instead.", resultCards: [], schemeCards: [], sources: [] }]);
      },
      () => setMessages(prev => [...prev, { role: "assistant", content: "I could not access your location. You can keep location private and tell me your city or area manually instead.", resultCards: [], schemeCards: [], sources: [] }]),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/chat/status")
      .then(response => response.json())
      .then(data => { if (data.success) setAiStatus(data.data); })
      .catch(() => setAiStatus({ provider: "local" }));
  }, [isOpen]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = event => {
      setInput(previous => `${previous} ${event.results[0][0].transcript}`.trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

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

  const handleSend = async (textToSend, reportToSend = attachedReport) => {
    const text = textToSend || input;
    const report = reportToSend;
    if ((!text.trim() && !report) || loading) return;

    const messageContent = text.trim() || `Uploaded medical report: ${report?.name}`;
    const userMessage = { 
      role: "user", 
      content: messageContent,
      attachedReport: report ? { name: report.name, size: report.size, type: report.type } : null
    };
    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setAttachedReport(null);
    setLoading(true);

    try {
      const res = await authFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          report: report ? { name: report.name, size: report.size, type: report.type } : null,
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

  // Sync initial location to session state if available
  useEffect(() => {
    if (initialLocation && initialLocation !== "All India") {
      setSessionState(prev => {
        if (!prev.context?.location) {
          return {
            ...prev,
            context: {
              ...prev.context,
              location: initialLocation,
              locationPermission: "granted"
            }
          };
        }
        return prev;
      });
    }
  }, [initialLocation]);

  // Automatically execute natural language AI analysis when opened with an initialPrompt or initialReport
  useEffect(() => {
    if (isOpen && (initialPrompt || initialReport)) {
      const query = (initialPrompt || "").trim();
      const reportName = initialReport?.name || "";
      const comboKey = `${query}:::${reportName}`;
      if (comboKey && lastExecutedPromptRef.current !== comboKey) {
        lastExecutedPromptRef.current = comboKey;
        if (onClearInitialPrompt) onClearInitialPrompt();
        handleSend(query, initialReport);
      }
    }
  }, [isOpen, initialPrompt, initialReport]);

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

  if (!isOpen) return null;

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
                {aiStatus?.provider === "openai" ? `OpenAI ${aiStatus.model}` : "Local fallback"}
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

          <div className="flex flex-wrap items-center gap-2 border-t border-surface-container-high pt-2.5">
            <button onClick={requestLocation} className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white">Use my location</button>
            <span className="text-[10px] text-tertiary">Optional. MedScout uses a coarse supported region for hospital matching and does not store coordinates.</span>
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
              {/* Attached Report Tag inside Message */}
              {msg.attachedReport && (
                <div className={`mb-2.5 p-2 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  msg.role === "user" ? "bg-white/20 text-white border border-white/30" : "bg-sky-50 text-sky-800 border border-sky-200"
                }`}>
                  <FileText className="w-4 h-4 shrink-0 text-cyan-200" />
                  <span className="truncate max-w-[200px]">{msg.attachedReport.name}</span>
                  <span className="text-[10px] opacity-80">({(msg.attachedReport.size / 1024).toFixed(0)} KB)</span>
                </div>
              )}

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

              {msg.comparisonCards && msg.comparisonCards.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-xl border border-primary/20 bg-surface-container-low">
                  <div className="flex items-center justify-between gap-3 border-b border-primary/15 bg-primary/5 px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                      <Layers className="h-3.5 w-3.5" /> Criteria-based comparison
                    </span>
                    <span className="text-[10px] text-tertiary">No universal best hospital</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[620px] w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="border-b border-surface-container-high bg-white/70 text-left">
                          <th className="p-2.5 font-bold text-tertiary">Measure</th>
                          {msg.comparisonCards.map(hospital => <th key={hospital.id} className="min-w-[145px] p-2.5 font-bold text-on-surface">{hospital.name}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-high/70">
                        {[
                          ["Ownership", hospital => hospital.ownership],
                          ["Subsidy Available", hospital => hospital.subsidyAvailable ? `✅ Yes (${hospital.subsidyType || "PM-JAY / Govt"})` : "❌ No (Private only)"],
                          ["Cost WITH Subsidy", hospital => hospital.costWithSubsidy || (hospital.subsidyAvailable ? "₹0 (Cashless PM-JAY)" : "Full private tariff")],
                          ["Cost WITHOUT Subsidy", hospital => hospital.costWithoutSubsidy || hospital.costRange || "Standard tariff"],
                          ["Annual volume", hospital => hospital.annualVolume ? `${hospital.annualVolume.toLocaleString("en-IN")} cases` : "Unavailable"],
                          ["30-day mortality", hospital => hospital.mortalityRate !== null ? `${hospital.mortalityRate}%` : "Unavailable"],
                          ["Documented cost", hospital => hospital.costRange],
                          ["Distance", hospital => `${hospital.distance} km`],
                          ["Evidence", hospital => hospital.confidence]
                        ].map(([label, value]) => (
                          <tr key={label} className="bg-white/50">
                            <th className="p-2.5 text-left font-semibold text-tertiary">{label}</th>
                            {msg.comparisonCards.map(hospital => <td key={hospital.id} className="p-2.5 font-medium text-on-surface-variant">{value(hospital)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="border-t border-primary/10 px-3 py-2 text-[10px] text-tertiary">MedScout compares the evidence against your stated priorities. Historical registry figures do not guarantee individual outcomes.</p>
                </div>
              )}

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

                        {h.significance && (
                          <p className="rounded-lg border border-primary/10 bg-primary/5 p-2 text-[10px] leading-relaxed text-on-surface-variant">
                            <span className="font-bold text-primary">Why this appears: </span>{h.significance}
                          </p>
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
          onClick={() => handleSend("run audit text")}
          className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Run Audit Text</span>
        </button>
        <button
          onClick={() => handleSend("compare hospitals on the basis of subsidy with or without subsidy available")}
          className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-colors"
        >
          Compare Subsidy Options
        </button>
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
        {/* Attached Report Preview Chip */}
        {attachedReport && (
          <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs mb-2 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="font-semibold truncate max-w-[220px]">{attachedReport.name}</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400">({(attachedReport.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedReport(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-sky-600 hover:text-red-600 p-1"
              title="Remove report"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAttachedReport({
                  name: file.name,
                  size: file.size,
                  type: file.type || "application/pdf"
                });
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Medical Report / Discharge Summary / Lab Test"
            className="p-2.5 rounded-xl border border-surface-container-high bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={attachedReport ? `Add instructions for ${attachedReport.name}...` : "Type condition, budget, or preferences (e.g. success rate > distance)..."}
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={!window.SpeechRecognition && !window.webkitSpeechRecognition}
            title={isListening ? "Stop voice input" : "Use voice input"}
            aria-label={isListening ? "Stop voice input" : "Use voice input"}
            className={`p-2.5 rounded-xl border border-surface-container-high transition-colors ${isListening ? "bg-danger text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            type="submit"
            disabled={(!input.trim() && !attachedReport) || loading}
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
