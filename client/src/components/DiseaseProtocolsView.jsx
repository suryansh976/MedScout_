import React, { useState, useEffect } from "react";
import { Activity, Stethoscope, Layers, FileSpreadsheet, CheckCircle2, ArrowRight } from "lucide-react";

export default function DiseaseProtocolsView({ onSelectCondition }) {
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);

  useEffect(() => {
    fetch("/api/diseases")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDiseases(data.data.diseases);
          setSelectedDisease(data.data.diseases[0]);
        }
      })
      .catch(err => console.error("Error loading diseases", err));
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest block">
          Clinical Taxonomy & Protocols
        </span>
        <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
          Disease-Specific Evidence Frameworks
        </h1>
        <p className="text-sm text-tertiary leading-relaxed">
          Hospital quality cannot be generalized across all departments. MedScout benchmarks facilities exclusively against specific condition codes (ICD-10) and established surgical pathways.
        </p>
      </div>

      {/* Disease Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {diseases.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDisease(d)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedDisease?.id === d.id
                ? "bg-white border-primary shadow-md ring-2 ring-primary/10"
                : "bg-surface-container-low/70 border-surface-container-high hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[11px] font-bold">
                {d.icd10}
              </span>
              <Activity className={`w-4 h-4 ${selectedDisease?.id === d.id ? "text-primary" : "text-tertiary"}`} />
            </div>
            <h3 className="font-headline font-bold text-sm text-on-surface leading-tight">
              {d.name}
            </h3>
            <span className="text-[11px] text-tertiary block mt-1">
              {d.category}
            </span>
          </button>
        ))}
      </div>

      {/* Detailed Protocol Breakdown */}
      {selectedDisease && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-container-high shadow-glass space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-container-high">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-secondary-container text-secondary">
                  ICD-10: {selectedDisease.icd10}
                </span>
                <span className="text-xs font-semibold text-tertiary">
                  {selectedDisease.category}
                </span>
              </div>
              <h2 className="font-headline font-bold text-2xl text-on-surface mt-2">
                {selectedDisease.name}
              </h2>
              <p className="text-sm text-tertiary mt-1 max-w-3xl">
                {selectedDisease.description}
              </p>
            </div>

            <button
              onClick={() => onSelectCondition(selectedDisease.name)}
              className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shrink-0"
            >
              <span>Search Hospitals for this Disease</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Clinical Benchmarks & Costing Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Common conditions</span>
                <div className="mt-2 flex flex-wrap gap-1.5">{(selectedDisease.commonConditions || []).map(item => <span key={item} className="rounded-lg bg-white px-2 py-1 text-[11px] text-on-surface border border-surface-container-high">{item}</span>)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Care pathway</span>
                <ul className="mt-2 space-y-1 text-[11px] text-on-surface">{(selectedDisease.carePathways || []).map(item => <li key={item}>• {item}</li>)}</ul>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Evidence measures</span>
                <ul className="mt-2 space-y-1 text-[11px] text-on-surface">{(selectedDisease.evidenceMeasures || []).map(item => <li key={item}>• {item}</li>)}</ul>
              </div>
            </div>

            {/* Key Clinical Quality Endpoints */}
            <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-surface-container-high space-y-3">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-secondary" />
                Registry-Audited Clinical Quality Endpoints
              </span>
              <ul className="text-xs text-on-surface space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">30-Day Risk-Adjusted Mortality: </span>
                    <span>Evaluated against STS/EACTS clinical thresholds, normalized for patient age and comorbid status.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Annual Institutional Caseload: </span>
                    <span>Verification of minimum procedural volume to ensure clinical team proficiency.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Post-Operative Complication Rate: </span>
                    <span>Deep sternal wound infection, surgical re-exploration, or prosthetic joint failure rates.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Standard Costing Template */}
            <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-surface-container-high space-y-3">
              <span className="text-xs font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-secondary" />
                MoHFW Standardized Costing Architecture
              </span>
              <p className="text-xs text-tertiary">
                Statutory breakdown ensuring price quotes include complete procedural care:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white border border-surface-container-high">
                  <span className="font-bold block text-on-surface">Pharmacy & Blood</span>
                  <span className="text-[11px] text-tertiary">Inpatient formulary drugs</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-surface-container-high">
                  <span className="font-bold block text-on-surface">Implants / Grafts</span>
                  <span className="text-[11px] text-tertiary">Prostheses & conduits</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-surface-container-high">
                  <span className="font-bold block text-on-surface">OT & Anesthesia</span>
                  <span className="text-[11px] text-tertiary">Equipment & gas tariffs</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-surface-container-high">
                  <span className="font-bold block text-on-surface">ICU & Room Bed</span>
                  <span className="text-[11px] text-tertiary">Dedicated nursing care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
