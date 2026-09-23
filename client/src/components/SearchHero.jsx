import React, { useEffect, useState } from "react";
import { 
  Search, 
  Sparkles, 
  Table, 
  MapPin, 
  BadgePercent, 
  ArrowRight, 
  ShieldCheck,
  Stethoscope,
  RotateCcw,
  Navigation,
  Upload,
  FileText,
  X,
  CheckCircle2
} from "lucide-react";
import ThreeHeroCanvas from "./ThreeHeroCanvas";
import HospitalMap2D from "./HospitalMap2D";

export default function SearchHero({ 
  onSearch, 
  onNaturalLanguageSearch, 
  selectedCondition, 
  setSelectedCondition,
  selectedBudget,
  setSelectedBudget,
  selectedScheme,
  setSelectedScheme,
  selectedLocation,
  setSelectedLocation,
  maxDistance,
  setMaxDistance,
  sortBy,
  setSortBy,
  hospitalCount = 5,
  hospitals = [],
  onSelectHospital,
  onLocationDetected
}) {
  const [searchMode, setSearchMode] = useState("structured");
  const [locationHub, setLocationHub] = useState(selectedLocation || "All India");
  const [detectingGps, setDetectingGps] = useState(false);
  const [nlpPrompt, setNlpPrompt] = useState("");
  const [language, setLanguage] = useState("English");
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert("Location access is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closest = "Delhi NCR";
        if (latitude > 27.5 && latitude < 29.5 && longitude > 76.5 && longitude < 78.5) closest = "Delhi NCR";
        else if (latitude > 30.0 && latitude < 32.0 && longitude > 75.0 && longitude < 77.5) closest = "Chandigarh";
        else if (latitude > 18.0 && latitude < 20.0 && longitude > 72.0 && longitude < 74.0) closest = "Mumbai";
        else if (latitude > 12.0 && latitude < 14.0 && longitude > 76.5 && longitude < 78.5) closest = "Bengaluru";
        else if (latitude > 12.0 && latitude < 14.0 && longitude > 79.5 && longitude < 81.0) closest = "Chennai";
        else if (latitude > 16.5 && latitude < 18.5 && longitude > 77.5 && longitude < 79.5) closest = "Hyderabad";
        else if (latitude > 22.0 && latitude < 23.5 && longitude > 87.5 && longitude < 89.5) closest = "Kolkata";
        else if (latitude > 26.0 && latitude < 28.0 && longitude > 75.0 && longitude < 77.0) closest = "Jaipur";
        else if (latitude > 26.0 && latitude < 27.5 && longitude > 80.0 && longitude < 82.0) closest = "Lucknow";

        setLocationHub(closest);
        setSelectedLocation(closest);
        if (onLocationDetected) {
          onLocationDetected({ city: closest, coords: { lat: latitude, lng: longitude } });
        }
        setDetectingGps(false);
      },
      () => {
        setDetectingGps(false);
        alert("Location access was denied. Please select your city from the list.");
      },
      { timeout: 8000 }
    );
  };

  const locationOptions = [
    "All India", "Delhi NCR", "New Delhi", "East Delhi", "Gurugram", 
    "Chandigarh", "Jalandhar", "Ludhiana", "Patiala", "Mandi", "Shimla", 
    "Mumbai", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Patna", 
    "Kolkata", "Hyderabad", "Bengaluru", "Chennai", "Kochi"
  ];

  useEffect(() => {
    fetch("/api/diseases")
      .then(response => response.json())
      .then(data => {
        if (data.success) setDiseaseOptions(data.data.diseases || []);
      })
      .catch(() => {});
  }, []);

  // Synchronize local locationHub with parent selectedLocation
  useEffect(() => {
    if (selectedLocation && selectedLocation !== locationHub) {
      setLocationHub(selectedLocation);
    }
  }, [selectedLocation]);

  const handleStructuredSubmit = (e) => {
    e.preventDefault();
    if (selectedLocation !== locationHub) {
      setSelectedLocation(locationHub);
    }
    onSearch({
      condition: selectedCondition,
      budgetTier: selectedBudget,
      locationRadius: locationHub,
      maxDistance,
      sortBy
    });
  };

  const handleNlpSubmit = (e) => {
    e.preventDefault();
    const promptToSend = nlpPrompt.trim() || (attachedFile ? `Medical report uploaded: ${attachedFile.name}. Please extract clinical parameters, ICD-10 indications, and recommend matching verified hospitals.` : "");
    if (!promptToSend) return;
    onNaturalLanguageSearch(promptToSend, attachedFile);
  };

  const setScenario = (promptText, condition, budget) => {
    setNlpPrompt(promptText);
    if (condition) setSelectedCondition(condition);
    if (budget) setSelectedBudget(budget);
    onNaturalLanguageSearch(promptText, null);
  };

  const handleResetFilters = () => {
    setSelectedCondition("Cardiology");
    setSelectedLocation("Delhi NCR");
    setLocationHub("Delhi NCR");
    setSelectedBudget("All Pricing Tiers & Schemes");
    if (setSelectedScheme) setSelectedScheme("All Schemes & Private");
    setMaxDistance(250);
    setSortBy("successRate");
  };

  return (
    <section className="relative w-full bg-white overflow-hidden pb-10 pt-8">
      {/* 3D WebGL Ambient Medical Network Canvas in Background */}
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
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
              Backed by Government Records
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-[11px] font-semibold text-tertiary uppercase">
              Zero Commercial Sponsorship
            </span>
          </div>

          {/* Display Hero Title */}
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-[1.15]">
            Find the Right Hospital, Backed by Real Data
          </h1>

          <p className="text-sm sm:text-base text-tertiary max-w-3xl leading-relaxed">
            Compare real treatment costs, procedure volumes, and clinical outcomes from verified statutory records — not paid ratings or sponsored placements.
          </p>
        </div>

        {/* Floating Glass Search Hub Container */}
        <div className="mt-8 w-full max-w-6xl mx-auto rounded-3xl glass-panel shadow-glass p-5 lg:p-7 border border-white/90">
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
                  Assistant
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>ABDM HFR Node #921-ND • MoHFW Synced</span>
            </div>
          </div>

          {/* MODE A: Structured Search Controls WITH 3D Map Alongside */}
          {searchMode === "structured" ? (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Streamlined Structured Search Form (7 cols on lg) */}
              <form onSubmit={handleStructuredSubmit} className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" /> Clinical Parameters
                    </span>
                    <span className="text-[11px] text-tertiary">
                      {hospitals.length} facilities verified
                    </span>
                  </div>

                  {/* 1. Condition Selector */}
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
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/80 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                      >
                        <option value="All Conditions">All Conditions</option>
                        {(diseaseOptions.length > 0 ? diseaseOptions : [
                          { name: "Cardiology", icd10: "I25.1" },
                          { name: "Coronary Artery Bypass (CABG)", icd10: "I25.1" },
                          { name: "Severe Knee Osteoarthritis", icd10: "M17.0" },
                          { name: "Hematologic Malignancies (Leukemia)", icd10: "C92.0" },
                          { name: "Chronic Kidney Disease", icd10: "N18.5" },
                          { name: "Nephrology", icd10: "N18" },
                          { name: "Oncology", icd10: "C80" },
                          { name: "Neurosciences", icd10: "G00-G99" },
                          { name: "Orthopedics", icd10: "M00-M99" },
                          { name: "Gastrointestinal and Liver Disorders", icd10: "K92.9" },
                          { name: "Endocrine and Metabolic Disorders", icd10: "E34.9" },
                          { name: "Respiratory Diseases", icd10: "J98.9" },
                          { name: "Pediatric and Developmental Conditions", icd10: "P94.9" },
                          { name: "Mental Health and Substance Use Disorders", icd10: "F99" },
                          { name: "General and Multi-Specialty Care", icd10: "Z00.9" }
                        ]).map(disease => (
                          <option key={disease.name} value={disease.name}>
                            {disease.name} {disease.icd10 ? `(${disease.icd10})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2-Column Row: Location + Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Location */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                          Location Hub
                        </label>
                        <button
                          type="button"
                          onClick={handleDetectGps}
                          disabled={detectingGps}
                          className="text-[11px] text-primary hover:text-primary-dark font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
                        >
                          <Navigation className={`w-3 h-3 ${detectingGps ? "animate-spin text-primary" : ""}`} />
                          <span>{detectingGps ? "Detecting GPS..." : "Detect GPS"}</span>
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                        <select
                          value={locationHub}
                          onChange={(e) => {
                            setLocationHub(e.target.value);
                            setSelectedLocation(e.target.value);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/80 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                        >
                          {locationOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Budget / Out-of-Pocket Cap */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                        Budget / Out-of-Pocket Cap
                      </label>
                      <div className="relative flex items-center">
                        <BadgePercent className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
                        <select
                          value={selectedBudget}
                          onChange={(e) => setSelectedBudget(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low/80 border border-surface-container-high text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                        >
                          <option value="All Pricing Tiers & Schemes">All Pricing Tiers & Schemes</option>
                          <option value="PM-JAY Standard Package Schedule (₹1.4L - ₹2.2L)">Under ₹2.2 Lakhs (Subsidized)</option>
                          <option value="₹2,00,000 – ₹3,50,000 (Tier 2-3 Institutional)">₹2.0L – ₹3.5L (Tier 2-3 Institutional)</option>
                          <option value="₹3,50,000 – ₹5,50,000 (Corporate High-Volume)">₹3.5L – ₹5.5L (Corporate High-Volume)</option>
                          <option value="Commercial TPA Insurance Cashless">Commercial TPA Cashless</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Row: Dedicated Government Schemes Filter + Sort By */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {/* Dedicated Government Schemes Filter */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Government Schemes</span>
                        </label>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Cashless / Subsidized
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <select
                          value={selectedScheme || "All Schemes & Private"}
                          onChange={(e) => {
                            if (setSelectedScheme) setSelectedScheme(e.target.value);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-emerald-50/50 border border-emerald-300/80 text-sm font-medium text-on-surface focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
                        >
                          <option value="All Schemes & Private">All Schemes &amp; Private Facilities</option>
                          <option value="Subsidized Hospitals Only">Subsidized Facilities Only (With Subsidy)</option>
                          <option value="Private Only (Without Subsidy)">Private Facilities Only (Without Subsidy)</option>
                          <option value="Ayushman Bharat (PM-JAY)">Ayushman Bharat (PM-JAY - Up to ₹5 Lakhs)</option>
                          <option value="Central Govt Health Scheme (CGHS)">Central Govt Health Scheme (CGHS)</option>
                          <option value="Ex-Servicemen Scheme (ECHS)">Ex-Servicemen Scheme (ECHS)</option>
                          <option value="State Government Health Schemes">State Government Schemes (DAK/MJPJAY/CMCHIS)</option>
                          <option value="Any Govt Scheme Accepted">Any Government Scheme Accepted</option>
                        </select>
                      </div>
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                        Sort results by
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-low/80 text-sm font-medium text-on-surface shadow-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      >
                        <option value="successRate">Success Rate &amp; Outcome Benchmark</option>
                        <option value="distance">Nearest Distance to Location</option>
                        <option value="cost">Lowest Documented Cost</option>
                        <option value="specialist">Specialist &amp; Facility Depth</option>
                      </select>
                    </div>
                  </div>

                  {/* Distance Slider */}
                  <div className="flex flex-col gap-1.5 bg-surface-container-low/40 p-3 rounded-xl border border-surface-container-high/60 mt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-tertiary uppercase tracking-wider">
                      <span>Max travel radius</span>
                      <span className="text-primary font-bold">
                        {maxDistance >= 500 ? "All Regions" : `${maxDistance} km`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="500"
                      step="25"
                      value={Math.min(maxDistance, 500)}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer mt-1"
                    />
                    <div className="flex justify-between text-[10px] text-tertiary">
                      <span>Local (25km)</span>
                      <span>State (250km)</span>
                      <span>All Regions (500km+)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Verified Providers ({hospitalCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    title="Reset to default filters"
                    className="py-3 px-4 rounded-xl border border-surface-container-high bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-tertiary" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Interactive 2D Regional Map & Suggestions (5 cols on lg) */}
              <div className="lg:col-span-5 flex flex-col h-full min-h-[440px]">
                <div className="flex-1 min-h-[420px]">
                  <HospitalMap2D
                    hospitals={hospitals}
                    selectedRegion={locationHub}
                    onSelectHospital={onSelectHospital}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* MODE B: Natural Language AI Diagnosis Intake */
            <form onSubmit={handleNlpSubmit} className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low/60 border border-surface-container-high">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    Describe your clinical situation in plain words
                  </span>
                  <span className="text-[11px] text-tertiary">
                    Multilingual Intake Available
                  </span>
                </div>

                <textarea
                  rows="3"
                  value={nlpPrompt}
                  onChange={(e) => setNlpPrompt(e.target.value)}
                  placeholder="Example: My 64-year-old father has 3-vessel coronary blockage and diabetes. We reside near Delhi NCR with a budget under ₹3.5 Lakhs. Which hospital has high CABG surgery volumes and low mortality?"
                  className="w-full p-3 rounded-lg border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all resize-none"
                />

                {/* Upload Medical Report Dropzone */}
                <div className="mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAttachedFile({
                          name: file.name,
                          size: file.size,
                          type: file.type || "application/pdf"
                        });
                        if (!nlpPrompt.trim()) {
                          setNlpPrompt(`Attached medical report: ${file.name}. Please extract diagnosis, ICD-10 indications, and recommend matching accredited hospitals.`);
                        }
                      }
                    }}
                  />

                  {attachedFile ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-in fade-in">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold truncate max-w-xs sm:max-w-md">
                              {attachedFile.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 text-[10px] font-bold text-emerald-800">
                              {(attachedFile.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Clinical report attached — AI ready to extract diagnosis &amp; parameters
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAttachedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1.5 rounded-lg text-emerald-700 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove attached report"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setAttachedFile({
                            name: file.name,
                            size: file.size,
                            type: file.type || "application/pdf"
                          });
                          if (!nlpPrompt.trim()) {
                            setNlpPrompt(`Attached medical report: ${file.name}. Please extract diagnosis, ICD-10 indications, and recommend matching accredited hospitals.`);
                          }
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer p-3 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
                        isDragging 
                          ? "border-secondary bg-secondary-container/30" 
                          : "border-surface-container-high hover:border-secondary/60 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-surface-container text-secondary shrink-0">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-on-surface">
                            Upload Medical Report / Discharge Summary / Lab Tests
                          </div>
                          <div className="text-[11px] text-tertiary">
                            PDF, JPG, PNG or DOC (Max 25MB) • Encrypted clinical document intake
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-secondary hover:text-white text-on-surface text-xs font-semibold transition-all shrink-0"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">Language:</span>
                    {["English", "Hindi", "Punjabi", "Bengali"].map(lang => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                          language === lang
                            ? "bg-secondary text-white font-semibold"
                            : "bg-surface-container-high text-tertiary hover:text-on-surface"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-lg bg-secondary hover:bg-secondary/90 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>{attachedFile ? "Analyze Uploaded Report with Clinical Assistant" : "Analyze with Clinical Assistant"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sample Guided Scenarios */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                  Or select a common clinical inquiry scenario:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setScenario("Father diagnosed with triple-vessel CAD. Needs CABG with low mortality and budget under ₹3.5 Lakhs in Delhi NCR.", "Cardiology", "₹2,00,000 – ₹3,50,000 (Tier 2-3 Institutional)")}
                    className="p-3 text-left rounded-xl border border-surface-container-high hover:border-secondary bg-surface-container-low/40 hover:bg-secondary-container/20 transition-all group"
                  >
                    <div className="text-xs font-bold text-on-surface group-hover:text-secondary">Cardiac Surgery (CABG)</div>
                    <div className="text-[11px] text-tertiary mt-0.5 line-clamp-2">Triple-vessel CAD, budget under ₹3.5 Lakhs, low 30-day mortality.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScenario("Severe bilateral knee osteoarthritis requiring robotic joint replacement under PM-JAY in Punjab or Delhi.", "Severe Knee Osteoarthritis", "PM-JAY Standard Package Schedule (₹1.4L - ₹2.2L)")}
                    className="p-3 text-left rounded-xl border border-surface-container-high hover:border-secondary bg-surface-container-low/40 hover:bg-secondary-container/20 transition-all group"
                  >
                    <div className="text-xs font-bold text-on-surface group-hover:text-secondary">Knee Arthroplasty (TKR)</div>
                    <div className="text-[11px] text-tertiary mt-0.5 line-clamp-2">Bilateral joint replacement under PM-JAY package schedule.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScenario("Stage 4 Chronic Kidney Disease with dialysis requirements looking for renal transplant center in Delhi NCR.", "Chronic Kidney Disease", "₹3,50,000 – ₹5,50,000 (Corporate High-Volume)")}
                    className="p-3 text-left rounded-xl border border-surface-container-high hover:border-secondary bg-surface-container-low/40 hover:bg-secondary-container/20 transition-all group"
                  >
                    <div className="text-xs font-bold text-on-surface group-hover:text-secondary">Renal Transplant & CKD</div>
                    <div className="text-[11px] text-tertiary mt-0.5 line-clamp-2">Dialysis and transplant readiness with verified organ registry status.</div>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
