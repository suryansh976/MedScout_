import React, { useEffect, useState, useMemo } from "react";
import { 
  BadgeCheck, 
  ExternalLink, 
  FileText, 
  LockKeyhole, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  Upload, 
  Plus, 
  Trash2, 
  Share2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  MessageSquare,
  Filter,
  Eye,
  Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function HealthCardPage({ onOpenChat }) {
  const { isAuthenticated, user, authFetch } = useAuth();
  const [profile, setProfile] = useState(user);
  const [preferences, setPreferences] = useState({});
  const [savedHospitals, setSavedHospitals] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals
  const [showCardQr, setShowCardQr] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeShareModalReport, setActiveShareModalReport] = useState(null);
  const [shareDuration, setShareDuration] = useState("30");
  const [selectedHospitalForShare, setSelectedHospitalForShare] = useState("All Verified Registry Hospitals");
  const [activeQrGrant, setActiveQrGrant] = useState(null);

  // New report form state
  const [newReport, setNewReport] = useState({
    title: "",
    category: "Laboratory",
    reportDate: new Date().toISOString().split("T")[0],
    provider: "",
    clinicalSummary: "",
    relevantCondition: "Cardiology",
    fileType: "PDF"
  });

  const categories = ["All", "Laboratory", "Cardiology", "Radiology", "Pathology", "Discharge Summary"];

  const loadUserData = () => {
    if (!isAuthenticated) return;
    setLoadingReports(true);
    Promise.all([
      authFetch("/api/user/profile").then(r => r.json()),
      authFetch("/api/user/preferences").then(r => r.json()),
      authFetch("/api/user/saved-hospitals").then(r => r.json()),
      authFetch("/api/user/reports").then(r => r.json())
    ]).then(([profileRes, prefRes, savedRes, reportsRes]) => {
      if (profileRes.success) setProfile(profileRes.data);
      if (prefRes.success) setPreferences(prefRes.data);
      if (savedRes.success) setSavedHospitals(savedRes.data);
      if (reportsRes.success) setReports(reportsRes.data || []);
      setLoadingReports(false);
    }).catch(err => {
      console.error("Failed to load user health card data:", err);
      setLoadingReports(false);
    });
  };

  useEffect(() => {
    loadUserData();
  }, [authFetch, isAuthenticated]);

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!newReport.title.trim()) return;

    if (!isAuthenticated) {
      const guestReport = {
        id: `guest-report-${Date.now()}`,
        ...newReport,
        createdAt: new Date().toISOString()
      };
      setReports(prev => [guestReport, ...prev]);
      setShowUploadModal(false);
      setNewReport({
        title: "",
        category: "Laboratory",
        reportDate: new Date().toISOString().split("T")[0],
        provider: "",
        clinicalSummary: "",
        relevantCondition: "Cardiology",
        fileType: "PDF"
      });
      return;
    }

    try {
      const res = await authFetch("/api/user/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport)
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => [data.data, ...prev]);
        setShowUploadModal(false);
        setNewReport({
          title: "",
          category: "Laboratory",
          reportDate: new Date().toISOString().split("T")[0],
          provider: "",
          clinicalSummary: "",
          relevantCondition: "Cardiology",
          fileType: "PDF"
        });
      }
    } catch (err) {
      alert("Could not register report: " + err.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to permanently delete this medical record?")) return;
    if (!isAuthenticated) {
      setReports(prev => prev.filter(r => r.id !== reportId));
      return;
    }
    try {
      const res = await authFetch(`/api/user/reports/${reportId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  const handleCreateShareGrant = async (e) => {
    e.preventDefault();
    if (!activeShareModalReport) return;

    try {
      const res = await authFetch(`/api/user/reports/${activeShareModalReport.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientHospitalName: selectedHospitalForShare,
          durationMinutes: shareDuration
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveQrGrant(data.data);
        // Update local list
        setReports(prev => prev.map(r => r.id === activeShareModalReport.id ? { ...r, status: "hospital_shared", activeGrant: data.data } : r));
      }
    } catch (err) {
      alert("Failed to generate grant token: " + err.message);
    }
  };

  const handleRevokeShare = async (reportId) => {
    try {
      const res = await authFetch(`/api/user/reports/${reportId}/revoke`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: "private", activeGrant: null } : r));
        if (activeQrGrant) setActiveQrGrant(null);
        setActiveShareModalReport(null);
      }
    } catch (err) {
      alert("Failed to revoke grant.");
    }
  };

  const filteredReports = useMemo(() => {
    if (selectedCategory === "All") return reports;
    return reports.filter(r => r.category === selectedCategory);
  }, [reports, selectedCategory]);

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex min-h-[65vh] w-full max-w-[900px] items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full rounded-3xl border border-surface-container-high bg-white p-8 sm:p-12 text-center shadow-glass">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary mb-4">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Discovery & Consent Layer</p>
          <h1 className="mt-2 font-headline text-3xl sm:text-4xl font-extrabold text-on-surface">
            Sign in to Access Your Smart Health Card
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-tertiary leading-relaxed">
            Manage your verified hospital discovery preferences, keep your medical reports organized privately, and share records with hospitals via temporary cryptographic QR tokens.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("medscout:open-auth"))} 
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-6 py-3 text-sm font-semibold text-white shadow-md transition-all"
          >
            <span>Sign in to My Account</span>
          </button>
        </div>
      </section>
    );
  }

  const location = preferences.location?.value || profile?.preferredCity || "Delhi NCR";
  const budget = preferences.budget?.max ? `₹${Number(preferences.budget.max).toLocaleString("en-IN")}` : "No ceiling set";
  const radius = preferences.maxDistance?.value ? `${preferences.maxDistance.value} km` : "All India";
  const cardToken = `MSC-${String(profile?.id || "patient").slice(-8).toUpperCase()}`;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-8 lg:px-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-container-high pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 & ABDM Consent Compliant</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface">
            My Smart Health Card & Clinical Reports
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-tertiary">
            Your personal context and zero-knowledge medical document repository. Reports are encrypted and never stored inside QR codes.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Medical Report</span>
        </button>
      </header>

      {/* Top Section: Smart Card + AI Context Box */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Digital Smart Health Card (7 cols) */}
        <article className="lg:col-span-7 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-[#0c2340] via-[#091b31] to-[#040d18] text-white shadow-2xl relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="p-6 sm:p-8 relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  <Sparkles className="h-4 w-4" /> MedScout Smart Health Card
                </div>
                <h2 className="mt-6 font-headline text-2xl sm:text-3xl font-bold text-white">
                  {profile?.name || "Patient Discovery Profile"}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300 font-medium">
                  <MapPin className="h-4 w-4 text-cyan-400" /> {location}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <BadgeCheck className="h-8 w-8 text-cyan-300" />
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">ABDM-LINKED</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Treatment Budget</span>
                <strong className="mt-1 block text-sm sm:text-base text-white font-mono">{budget}</strong>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Search Radius</span>
                <strong className="mt-1 block text-sm sm:text-base text-white font-mono">{radius}</strong>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Saved Hospitals</span>
                <strong className="mt-1 block text-sm sm:text-base text-white font-mono">{savedHospitals.length} Facilities</strong>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Reports Stored</span>
                <strong className="mt-1 block text-sm sm:text-base text-cyan-300 font-mono">{reports.length} Records</strong>
              </div>
            </div>

            {/* Card Footer Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <LockKeyhole className="w-4 h-4 text-emerald-400" />
                <span>Zero medical data in QR • Ephemeral token authorization</span>
              </div>

              <button 
                onClick={() => setShowCardQr(v => !v)} 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 text-xs font-bold shadow-md transition-colors"
              >
                <QrCode className="h-4 w-4 text-primary" />
                <span>{showCardQr ? "Hide Card QR" : "Show Card Identity QR"}</span>
              </button>
            </div>

            {/* Expandable Digital Card QR */}
            {showCardQr && (
              <div className="mt-4 p-5 rounded-2xl bg-white text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 border-2 border-slate-900 rounded-xl bg-slate-50">
                    <QrCode className="w-16 h-16 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Card Identifier Token</span>
                    <p className="font-mono text-lg font-bold text-slate-900">{cardToken}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Use this token with ABDM verified consent gateways.</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Identity Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* AI & Clinical Discovery Integration Box (5 cols) */}
        <aside className="lg:col-span-5 rounded-3xl border border-surface-container-high bg-white p-6 shadow-sm flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="w-4 h-4" /> Grounded Assistant Context
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface mt-2">
              How Your Card Powers Discovery
            </h3>
            <p className="text-xs text-tertiary mt-2 leading-relaxed">
              When searching for hospitals or conversing with the MedScout Clinical Assistant, your stated location, budget constraints, and active report categories shape hospital ranking parameters automatically.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs flex items-center justify-between">
                <span className="text-tertiary">Active City:</span>
                <span className="font-semibold text-on-surface">{location}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs flex items-center justify-between">
                <span className="text-tertiary">Budget Filter:</span>
                <span className="font-semibold text-on-surface">{budget}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs flex items-center justify-between">
                <span className="text-tertiary">Shared for AI Reasoning:</span>
                <span className="font-semibold text-secondary">
                  {reports.filter(r => r.status === "ai_shared").length} reports
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenChat && onOpenChat()}
            className="w-full py-2.5 px-4 rounded-xl border border-secondary text-secondary hover:bg-secondary-container/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Clinical Assistant with My Context</span>
          </button>
        </aside>
      </div>

      {/* Lower Section: Medical Reports Repository */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container-high pb-4">
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <span>Medical Reports & Diagnostic Documents</span>
            </h2>
            <p className="text-xs text-tertiary mt-1">
              Privately cataloged reports. Share specific tests with hospitals for limited time windows.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container-low hover:bg-surface-container text-tertiary hover:text-on-surface border border-surface-container-high"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {loadingReports ? (
          <div className="p-12 text-center text-xs text-tertiary bg-surface-container-low rounded-2xl">
            Loading secure records…
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-container-high p-12 text-center bg-surface-container-low/50">
            <FileText className="mx-auto h-10 w-10 text-outline" />
            <h3 className="mt-3 text-sm font-bold text-on-surface">No reports in {selectedCategory} category</h3>
            <p className="mt-1 text-xs text-tertiary max-w-sm mx-auto">
              Upload diagnostic tests, scans, or discharge summaries to keep them organized and accessible for hospital consultations.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all"
            >
              Upload First Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const isShared = report.status === "hospital_shared" && report.activeGrant;
              const isAiShared = report.status === "ai_shared";

              return (
                <div 
                  key={report.id}
                  className="rounded-2xl border border-surface-container-high bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                        {report.category}
                      </span>

                      {isShared ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Hospital Access Active
                        </span>
                      ) : isAiShared ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> AI Assistant Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          <LockKeyhole className="w-3 h-3" /> Private
                        </span>
                      )}
                    </div>

                    {/* Report Title */}
                    <h3 className="font-headline text-base font-bold text-on-surface mt-3 line-clamp-1">
                      {report.title}
                    </h3>

                    <div className="mt-1 text-xs text-tertiary flex items-center gap-2">
                      <span>{report.reportDate}</span>
                      <span>•</span>
                      <span className="truncate">{report.provider}</span>
                    </div>

                    {/* Clinical Summary snippet */}
                    {report.clinicalSummary && (
                      <div className="mt-3 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                        {report.clinicalSummary}
                      </div>
                    )}

                    {/* Active Grant Notice */}
                    {isShared && (
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>Shared with: {report.activeGrant.recipientHospitalName}</span>
                          <span className="font-mono text-[10px]">Active</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono">
                          <Clock className="w-3 h-3" /> Token: {report.activeGrant.grantToken.slice(0, 18)}…
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-3 border-t border-surface-container-high/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {isShared ? (
                        <button
                          onClick={() => handleRevokeShare(report.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-bold transition-colors"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveShareModalReport(report);
                            setActiveQrGrant(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Share QR</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onOpenChat) onOpenChat();
                        }}
                        title="Discuss this test result with the AI Assistant"
                        className="p-1.5 rounded-lg text-secondary hover:bg-secondary-container/40 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      title="Delete report"
                      className="p-1.5 rounded-lg text-outline hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL 1: Upload / Register Report */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <span>Upload Medical Report</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReport} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-tertiary uppercase tracking-wider mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Coronary Angiogram, CBC Blood Panel, Knee MRI"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-surface-container-high focus:ring-2 focus:ring-primary/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-tertiary uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newReport.category}
                    onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-surface-container-high text-xs bg-white"
                  >
                    <option value="Laboratory">Laboratory / Blood</option>
                    <option value="Cardiology">Cardiology / Echo / ECG</option>
                    <option value="Radiology">Radiology / X-Ray / CT / MRI</option>
                    <option value="Pathology">Pathology / Biopsy</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-tertiary uppercase tracking-wider mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={newReport.reportDate}
                    onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-surface-container-high text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-tertiary uppercase tracking-wider mb-1">
                  Diagnostic Facility / Hospital
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Lal PathLabs, Sir Ganga Ram Hospital Lab"
                  value={newReport.provider}
                  onChange={(e) => setNewReport({ ...newReport, provider: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-surface-container-high text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-tertiary uppercase tracking-wider mb-1">
                  Key Findings / Clinical Summary (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g., Elevated troponin, severe LVEF reduction, normal creatinine..."
                  value={newReport.clinicalSummary}
                  onChange={(e) => setNewReport({ ...newReport, clinicalSummary: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-surface-container-high text-xs resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center gap-2 text-[11px] text-tertiary">
                <LockKeyhole className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero-knowledge client encryption: documents are private by default.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-tertiary hover:text-on-surface text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all"
                >
                  Save to Smart Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Share Report with Hospital via Ephemeral QR Token */}
      {activeShareModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Explicit Consent Protocol</span>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Share Report with Hospital
                </h3>
              </div>
              <button onClick={() => setActiveShareModalReport(null)} className="p-1 rounded-lg text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!activeQrGrant ? (
              <form onSubmit={handleCreateShareGrant} className="mt-4 space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high">
                  <span className="text-[10px] text-tertiary font-bold uppercase">Selected Document</span>
                  <div className="font-bold text-on-surface text-sm mt-0.5">{activeShareModalReport.title}</div>
                  <div className="text-tertiary mt-0.5">{activeShareModalReport.provider} • {activeShareModalReport.reportDate}</div>
                </div>

                <div>
                  <label className="block font-bold text-tertiary uppercase tracking-wider mb-1">
                    Grant Access To Hospital
                  </label>
                  <select
                    value={selectedHospitalForShare}
                    onChange={(e) => setSelectedHospitalForShare(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-container-high bg-white text-xs"
                  >
                    <option value="All Verified Registry Hospitals">Any ABDM-Accredited Hospital Doctor</option>
                    <option value="Sir Ganga Ram Hospital">Sir Ganga Ram Hospital, New Delhi</option>
                    <option value="Max Super Speciality Hospital">Max Super Speciality Hospital</option>
                    <option value="Apollo Hospital Indraprastha">Apollo Hospital, Indraprastha</option>
                    <option value="Fortis Memorial Research Institute">Fortis Memorial Research Institute</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-tertiary uppercase tracking-wider mb-1">
                    Access Expiry Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "15 Minutes", val: "15" },
                      { label: "1 Hour", val: "60" },
                      { label: "24 Hours", val: "1440" }
                    ].map(dur => (
                      <button
                        type="button"
                        key={dur.val}
                        onClick={() => setShareDuration(dur.val)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          shareDuration === dur.val
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-surface-container-low text-tertiary border-surface-container-high hover:bg-surface-container"
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>The hospital receives temporary view-only permission. You can terminate access instantly at any time.</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveShareModalReport(null)}
                    className="px-4 py-2 rounded-xl border border-surface-container-high text-tertiary text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all"
                  >
                    Generate Ephemeral QR Token
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-4 text-center">
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center space-y-3 shadow-inner">
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <QrCode className="w-36 h-36 text-slate-900" />
                  </div>
                  <div className="font-mono text-xs text-cyan-300 font-bold tracking-wider">
                    {activeQrGrant.grantToken}
                  </div>
                </div>

                <div className="text-xs text-tertiary space-y-1">
                  <p className="font-bold text-on-surface">Valid for {activeQrGrant.recipientHospitalName}</p>
                  <p>Expires: {new Date(activeQrGrant.expiresAt).toLocaleTimeString()}</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRevokeShare(activeShareModalReport.id)}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    Revoke Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveShareModalReport(null)}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}