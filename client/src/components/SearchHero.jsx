import React, { useEffect, useState } from "react";
import { 
  Search, 
  Sparkles, 
  Table, 
  MapPin, 
  BadgePercent, 
  Award, 
  Layers, 
  ArrowRight, 
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import ThreeHeroCanvas from "./ThreeHeroCanvas";

export default function SearchHero({ 
  onSearch, 
  onNaturalLanguageSearch, 
  selectedCondition, 
  setSelectedCondition,
  selectedBudget,
  setSelectedBudget,
  hospitalCount = 5 
}) {
  const [searchMode, setSearchMode] = useState("ai");
  const [treatment, setTreatment] = useState("Minimally Invasive On-Pump (CABG)");
  const [locationHub, setLocationHub] = useState("New Delhi NCR (Within 25 km)");
  const [accreditation, setAccreditation] = useState("NABH Tertiary + ABDM HFR Synced");
  const [nlpPrompt, setNlpPrompt] = useState("");
  const [language, setLanguage] = useState("English");
  const [diseaseOptions, setDiseaseOptions] = useState([]);

  useEffect(() => {
    fetch("/api/diseases")
      .then(response => response.json())
      .then(data => {
        if (data.success) setDiseaseOptions(data.data.diseases || []);
      })
      .catch(() => {});
  }, []);

  const handleStructuredSubmit = (e) => {
    e.preventDefault();
    onSearch({
      condition: selectedCondition,
      treatment,
      budgetTier: selectedBudget,
      locationRadius: locationHub,
      accreditation
    });
  };

  const handleNlpSubmit = (e) => {
    e.preventDefault();
    if (!nlpPrompt.trim()) return;
    onNaturalLanguageSearch(nlpPrompt);
  };

  const setScenario = (promptText, condition, budget) => {
    setNlpPrompt(promptText);
    if (condition) setSelectedCondition(condition);
    if (budget) setSelectedBudget(budget);
    onNaturalLanguageSearch(promptText);
  };

  return (
    <section className="relative w-full bg-white overflow-hidden pb-12 pt-8">
      {/* 3D WebGL Ambient Medical Network Canvas */}
      <ThreeHeroCanvas />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl"></div>
        <div className="absolute top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-primary-fixed/50 blur-3xl"></div>
        <svg className="absolute inset-0 w-full h-full stroke-outline-variant/30" fill="none">
          <pattern id="clinical-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="0.5" />
            <circle cx="24" cy="24" r="1" className="fill-secondary/30" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#clinical-grid)" />
        </svg>
      </div>

      <div className="relative w-full px-4 lg:px-8 max-w-[1440px] mx-auto z-10">
        {/* Clinical Top Badge */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
              Backed by Government Records
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-[11px] font-semibold text-tertiary uppercase">
              No Paid Listings
            </span>
          </div>

          {/* Display Hero Title */}
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-[1.15]">
            Find the Right Hospital, Backed by Real Data
          </h1>

          <p className="text-base sm:text-lg text-tertiary max-w-3xl leading-relaxed">
            Compare real treatment costs and outcomes from verified government records — not paid ratings or sponsored listings.
          </p>
        </div>

        {/* Floating Glass Search Hub Container */}
        <div className="mt-8 w-full max-w-5xl mx-auto rounded-2xl glass-panel shadow-glass p-5 lg:p-7 border border-white/80">
          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-5 gap-3 border-b border-surface-container-high/60">
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-surface-container-high/60">
              <button
                type="button"
                onClick={() => setSearchMode("structured")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  searchMode === "structured"
                    ? "bg-primary text-white shadow-sm"
                    : "text-tertiary hover:text-on-surface"
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Structured Clinical Search</span>
              </button>

              <button
                type="button"
                onClick={() => setSearchMode("ai")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  searchMode === "ai"
                    ? "bg-primary text-white shadow-sm"
                    : "text-tertiary hover:text-on-surface"
                }`}
              >
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>Natural Language AI Intake</span>
                <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] font-bold">
                  New
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>ABDM HFR Node #921-ND Verified</span>
            </div>
          </div>

          {/* MODE A: Structured Search Controls */}
          {searchMode === "structured" ? (
            <form onSubmit={handleStructuredSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Condition */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                      Medical Condition / ICD-10
                    </label>
                    <span className="text-[10px] font-bold text-primary uppercase">Required</span>
                  </div>
                  <div className="relative flex items-center">
                    <Stethoscope className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/70 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                      {(diseaseOptions.length > 0 ? diseaseOptions : [
                        { name: "Coronary Artery Bypass (CABG)", icd10: "I25.1" },
                        { name: "Severe Knee Osteoarthritis", icd10: "M17.0" },
                        { name: "Hematologic Malignancies (Leukemia)", icd10: "C92.0" },
                        { name: "Chronic Kidney Disease", icd10: "N18.5" }
                      ]).map(disease => (
                        <option key={disease.name} value={disease.name}>{disease.name} - {disease.icd10}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Treatment / Procedure */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                    Treatment / Technique
                  </label>
                  <div className="relative flex items-center">
                    <Layers className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                    <select
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/70 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="Minimally Invasive On-Pump (CABG)">Minimally Invasive On-Pump (CABG)</option>
                      <option value="Off-Pump Coronary Artery Bypass (OPCAB)">Off-Pump Coronary Artery Bypass (OPCAB)</option>
                      <option value="Robotic Assisted Revascularization">Robotic Assisted Revascularization</option>
                      <option value="Percutaneous Coronary Intervention (PCI)">Percutaneous Coronary Intervention (PCI)</option>
                      <option value="Bilateral Total Knee Arthroplasty (TKR)">Bilateral Total Knee Arthroplasty (TKR)</option>
                      <option value="CAR-T Cell Immunotherapy">CAR-T Cell Immunotherapy</option>
                    </select>
                  </div>
                </div>

                {/* 3. Budget Tier */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                    Budget / Payer Package
                  </label>
                  <div className="relative flex items-center">
                    <BadgePercent className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/70 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="All Pricing Tiers & Schemes">All Pricing Tiers & Schemes</option>
                      <option value="PM-JAY Standard Package Schedule (₹1.4L - ₹2.2L)">PM-JAY Standard Package Schedule (₹1.4L - ₹2.2L)</option>
                      <option value="₹2,00,000 – ₹3,50,000 (Tier 2-3 Institutional)">₹2,00,000 – ₹3,50,000 (Tier 2-3 Institutional)</option>
                      <option value="₹3,50,000 – ₹5,50,000 (Corporate High-Volume)">₹3,50,000 – ₹5,50,000 (Corporate High-Volume)</option>
                      <option value="Commercial TPA Insurance Cashless">Commercial TPA Insurance Cashless</option>
                    </select>
                  </div>
                </div>

                {/* 4. Location Hub */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                    Location
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={locationHub}
                      onChange={(e) => setLocationHub(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/70 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* 5. Accreditation */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                    Hospital Certification
                  </label>
                  <div className="relative flex items-center">
                    <Award className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                    <select
                      value={accreditation}
                      onChange={(e) => setAccreditation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/70 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="NABH Tertiary + ABDM HFR Synced">NABH Tertiary + ABDM HFR Synced</option>
                      <option value="ICMR Certified Research Center">ICMR Certified Research Center</option>
                      <option value="JCI International Accredited">JCI International Accredited</option>
                      <option value="MoHFW Apex Teaching Institute">MoHFW Apex Teaching Institute</option>
                    </select>
                  </div>
                </div>

                {/* 6. Search CTA Button */}
                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Verified Hospitals ({hospitalCount})</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* MODE B: Natural Language AI Diagnosis Intake */
            <form onSubmit={handleNlpSubmit} className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low/60 border border-surface-container-high">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Describe your situation in your own words
                  </span>
                  <label className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-tertiary">
                    Language
                    <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-md border border-surface-container-high bg-white px-1.5 py-1 text-[11px] text-on-surface">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Punjabi</option>
                    </select>
                  </label>
                </div>
                <textarea
                  rows="3"
                  value={nlpPrompt}
                  onChange={(e) => setNlpPrompt(e.target.value)}
                  placeholder="Tell us what is going on, where you are, and your budget. You can describe symptoms or a confirmed condition in your own words."
                  className="w-full p-3 rounded-xl bg-white border border-surface-container-high text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-tertiary">
                  <span className="font-semibold">Try an example:</span>
                  <button
                    type="button"
                    onClick={() => setNlpPrompt("I don't know what's wrong. I have symptoms and need help finding the right specialty.")}
                    className="px-2.5 py-1 rounded-lg bg-primary text-white transition-colors"
                  >
                    Not sure what this is?
                  </button>
                  <button
                    type="button"
                    onClick={() => setScenario("My father has triple vessel disease, budget is around 3 Lakhs in NCR, need hospitals with published CABG volume.", "Coronary Artery Bypass (CABG)", "₹2,00,000 – ₹3,50,000 (Tier 2-3 Institutional)")}
                    className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                  >
                    Triple Vessel CABG under ₹3L
                  </button>
                  <button
                    type="button"
                    onClick={() => setScenario("Show high-volume centers for bilateral knee replacement under PM-JAY package.", "Severe Knee Osteoarthritis", "PM-JAY Standard Package Schedule (₹1.4L - ₹2.2L)")}
                    className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                  >
                    Bilateral Knee under PM-JAY
                  </button>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Find hospitals</span>
                </button>
              </div>
            </form>
          )}

          {/* Audited Datasets Fast Filters */}
          <div className="mt-5 pt-4 border-t border-surface-container-high/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-tertiary uppercase tracking-wider mr-1">
              Verified data available for:
            </span>
            <button
              onClick={() => setSelectedCondition("Coronary Artery Bypass (CABG)")}
              className="px-3 py-1 rounded-full text-xs font-medium bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors border border-surface-container-high/50 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              CABG with Published 30-Day Mortality
            </button>
            <button
              onClick={() => {
                setSelectedCondition("Severe Knee Osteoarthritis");
                setSelectedBudget("PM-JAY Standard Package Schedule (₹1.4L - ₹2.2L)");
              }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors border border-surface-container-high/50 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Bilateral Knee Replacement under ₹1.8L
            </button>
            <button
              onClick={() => setSelectedCondition("Hematologic Malignancies (Leukemia)")}
              className="px-3 py-1 rounded-full text-xs font-medium bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors border border-surface-container-high/50 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Pediatric Hematology Oncology Units
            </button>
            <button
              className="px-3 py-1 rounded-full text-xs font-medium bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors border border-surface-container-high/50 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              ABDM HFR Registry Linked Only
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
