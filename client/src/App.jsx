import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProvenanceStrip from "./components/ProvenanceStrip";
import SearchHero from "./components/SearchHero";
import HospitalCard from "./components/HospitalCard";
import FloatingCompareTray from "./components/FloatingCompareTray";
import CompareMatrix from "./components/CompareMatrix";
import AIChatbotDrawer from "./components/AIChatbotDrawer";
import HospitalDetailModal from "./components/HospitalDetailModal";
import RankingMethodologySection from "./components/RankingMethodologySection";
import AdminVerificationView from "./components/AdminVerificationView";
import DataProvenanceView from "./components/DataProvenanceView";
import DiseaseProtocolsView from "./components/DiseaseProtocolsView";
import Footer from "./components/Footer";
import ProfilePage from "./pages/ProfilePage.jsx";
import HealthCardPage from "./pages/HealthCardPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Sparkles, SlidersHorizontal, RefreshCw } from "lucide-react";

export default function App() {
  const { isVerifier } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem("medscout-theme") === "dark");
  const [activeTab, setActiveTab] = useState("discovery"); // discovery, card, protocols, provenance, admin
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitalError, setHospitalError] = useState("");

  // Filters
  const [selectedCondition, setSelectedCondition] = useState("Coronary Artery Bypass (CABG)");
  const [selectedBudget, setSelectedBudget] = useState("All Pricing Tiers & Schemes");

  // Queued hospitals for side-by-side comparison
  const [queuedHospitals, setQueuedHospitals] = useState([]);
  const [isCompareMatrixOpen, setIsCompareMatrixOpen] = useState(false);

  // Selected hospital for deep-dive detail dossier
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState(null);

  // AI Chatbot Drawer
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("medscout-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Fetch hospitals based on active condition & budget
  const fetchHospitals = async () => {
    setLoading(true);
    setHospitalError("");
    try {
      let url = `/api/hospitals?disease=${encodeURIComponent(selectedCondition)}&query=`;
      if (selectedBudget && selectedBudget.includes("PM-JAY")) {
        url += `&maxBudget=220000`;
      } else if (selectedBudget && selectedBudget.includes("3,50,000")) {
        url += `&maxBudget=360000`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Hospital registry returned ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
        // Pre-populate queue with first 2 benchmark hospitals for immediate demo comparison
        if (queuedHospitals.length === 0 && data.data.length >= 2) {
          setQueuedHospitals([data.data[0], data.data[1]]);
        }
      } else {
        throw new Error(data.error || "Hospital registry request failed");
      }
    } catch (err) {
      console.error("Failed to load hospitals:", err);
      setHospitals([]);
      setHospitalError("Hospital registry is unavailable. Start the MedScout server on port 5000 and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedCondition, selectedBudget]);

  const handleToggleQueue = (hospital) => {
    setQueuedHospitals(prev => {
      const exists = prev.some(h => h.id === hospital.id);
      if (exists) {
        return prev.filter(h => h.id !== hospital.id);
      } else {
        if (prev.length >= 4) {
          alert("Maximum 4 facilities can be compared simultaneously in the matrix.");
          return prev;
        }
        return [...prev, hospital];
      }
    });
  };

  const handleRemoveFromQueue = (id) => {
    setQueuedHospitals(prev => prev.filter(h => h.id !== id));
  };

  const handleClearQueue = () => {
    setQueuedHospitals([]);
  };

  const handleStructuredSearch = (searchParams) => {
    fetchHospitals();
  };

  const handleNaturalLanguageSearch = (prompt) => {
    setIsChatOpen(true);
  };

  const handleApplyExtractedFilters = (filters) => {
    if (filters.disease) setSelectedCondition(filters.disease);
    if (filters.budgetCelling) setSelectedBudget(filters.budgetCelling);
    fetchHospitals();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-on-surface antialiased selection:bg-primary-fixed selection:text-primary">
      {/* 1. Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queuedCount={queuedHospitals.length}
        onOpenCompare={() => setIsCompareMatrixOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenProfile={() => setActiveTab("profile")}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(value => !value)}
      />

      <main className="flex-1 pt-16">
        {/* VIEW 1: SEARCH & DISCOVERY (HOME) */}
        {activeTab === "discovery" && (
          <div className="space-y-0">
            {/* Search Hero with 3D Ambient WebGL Network */}
            <SearchHero
              onSearch={handleStructuredSearch}
              onNaturalLanguageSearch={handleNaturalLanguageSearch}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              selectedBudget={selectedBudget}
              setSelectedBudget={setSelectedBudget}
              hospitalCount={hospitals.length}
            />

            {/* Statutory Provenance Strip */}
            <ProvenanceStrip />

            {/* Featured Live Comparison Matrix Section */}
            <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 gap-4 border-b border-surface-container-high/60">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-secondary-container text-secondary text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <span>Updated quarterly • Last check: Q3</span>
                  </div>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface">
                    Clinical Comparison: {selectedCondition}
                  </h2>
                  <p className="text-xs sm:text-sm text-tertiary mt-1">
                    Sourced from official government health records for hospitals in Delhi NCR.
                  </p>
                </div>

              </div>

              {/* Live Hospital Cards Grid */}
              {loading ? (
                <div className="mt-8 rounded-2xl border border-surface-container-high bg-surface-container-low p-8 text-center text-sm text-tertiary">
                  Loading hospitals from the clinical registry…
                </div>
              ) : hospitalError ? (
                <div className="mt-8 rounded-2xl border border-danger/30 bg-danger-light p-8 text-center text-sm text-danger">
                  <p>{hospitalError}</p>
                  <button onClick={fetchHospitals} className="mt-4 rounded-lg bg-danger px-4 py-2 text-xs font-semibold text-white">Retry registry connection</button>
                </div>
              ) : hospitals.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-warning/30 bg-warning-light p-8 text-center text-sm text-warning">
                  No hospitals match the current search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
                  {hospitals.map((hosp) => (
                    <HospitalCard
                      key={hosp.id}
                      hospital={hosp}
                      isQueued={queuedHospitals.some(q => q.id === hosp.id)}
                      onToggleQueue={handleToggleQueue}
                      onOpenDetails={(h) => setSelectedHospitalForModal(h)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Transparent 5-Tier Ranking Methodology Section */}
            <RankingMethodologySection
              onReadMethodology={() => setActiveTab("provenance")}
            />
          </div>
        )}

        {/* VIEW 2: DISEASE PROTOCOLS */}
        {activeTab === "protocols" && (
          <DiseaseProtocolsView
            onSelectCondition={(cond) => {
              setSelectedCondition(cond);
              setActiveTab("discovery");
            }}
          />
        )}

        {/* VIEW 3: DATA PROVENANCE & REGISTRY STANDARDS */}
        {activeTab === "provenance" && <DataProvenanceView />}

        {activeTab === "card" && <HealthCardPage onOpenChat={() => setIsChatOpen(true)} />}

        {/* VIEW 4: ADMIN VERIFICATION WORKBENCH */}
        {activeTab === "admin" && (isVerifier() ? <AdminVerificationView /> : null)}
        {activeTab === "profile" && <ProfilePage />}
      </main>

      {/* Floating Docked Comparison Queue Bar */}
      <FloatingCompareTray
        queuedHospitals={queuedHospitals}
        onClear={handleClearQueue}
        onOpenCompare={() => setIsCompareMatrixOpen(true)}
      />

      {/* Side-by-Side Comparison Matrix Modal */}
      {isCompareMatrixOpen && (
        <CompareMatrix
          hospitals={queuedHospitals.length > 0 ? queuedHospitals : hospitals.slice(0, 3)}
          onClose={() => setIsCompareMatrixOpen(false)}
          onRemoveHospital={handleRemoveFromQueue}
        />
      )}

      {/* Deep-Dive Hospital Detail Dossier Modal */}
      {selectedHospitalForModal && (
        <HospitalDetailModal
          hospital={selectedHospitalForModal}
          onClose={() => setSelectedHospitalForModal(null)}
          onQueue={handleToggleQueue}
        />
      )}

      {/* Slide-over Grounded AI Chatbot Drawer */}
      <AIChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onApplyExtractedFilters={handleApplyExtractedFilters}
        onViewHospital={(h) => setSelectedHospitalForModal(h)}
        onQueueHospital={(h) => handleToggleQueue(h)}
      />

      {/* Footer */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab)} />
    </div>
  );
}
