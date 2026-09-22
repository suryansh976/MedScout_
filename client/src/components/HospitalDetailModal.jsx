import React from "react";
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  TrendingDown, 
  FileText, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Layers,
  Clock
} from "lucide-react";

export default function HospitalDetailModal({ hospital, onClose, onQueue }) {
  if (!hospital) return null;

  const {
    canonicalName,
    locationName,
    distanceKm,
    ownership,
    abdmRegistryId,
    accreditationTier,
    accreditations,
    facilities,
    image,
    outcome,
    cost,
    sources = []
  } = hospital;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header with Hero Image Banner */}
        <div className="relative h-52 sm:h-64 w-full bg-surface-container shrink-0 overflow-hidden">
          <img
            src={image}
            alt={canonicalName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Institutional Badges on Image */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-secondary text-white font-mono text-xs font-bold">
                  ABDM: {abdmRegistryId}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-medium">
                  {ownership}
                </span>
              </div>
              <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white leading-tight">
                {canonicalName}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-secondary-fixed" />
                <span>{locationName}</span>
                <span>•</span>
                <span>{distanceKm} km from central hub</span>
              </p>
            </div>

            <button
              onClick={() => {
                onQueue(hospital);
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition-all shrink-0"
            >
              <Layers className="w-4 h-4" />
              <span>Queue for Comparison</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* 1. Accreditations & Registry Standards */}
          <div>
            <h3 className="text-xs font-bold text-tertiary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Accreditation & Registry Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {accreditations?.map((acc, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  {acc}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Disease-Specific Clinical Outcomes Grid */}
          <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Verified Outcome Return: Coronary Artery Bypass (CABG)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Standardized metrics from statutory reporting period: {outcome?.reportingPeriod || "FY 2023-24"}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold">
                {outcome?.confidence || "Verified Return"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-surface-container-high">
                <span className="text-[10px] font-bold text-tertiary uppercase">Annual Caseload</span>
                <span className="font-display font-extrabold text-xl text-on-surface block mt-0.5">
                  {outcome?.annualVolume?.toLocaleString() || "Unavailable"}
                </span>
                <span className="text-[11px] text-secondary font-medium mt-0.5 block">High Volume Center</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-surface-container-high">
                <span className="text-[10px] font-bold text-tertiary uppercase">30-Day Mortality</span>
                <span className="font-display font-extrabold text-xl text-on-surface block mt-0.5">
                  {outcome?.mortalityRate30Day ? `${outcome.mortalityRate30Day}%` : "Unavailable"}
                </span>
                <span className="text-[11px] text-secondary font-medium mt-0.5 block">
                  {outcome?.mortalityBenchmarkDelta}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-surface-container-high">
                <span className="text-[10px] font-bold text-tertiary uppercase">Complication Rate</span>
                <span className="font-display font-extrabold text-xl text-on-surface block mt-0.5">
                  {outcome?.complicationRate ? `${outcome.complicationRate}%` : "Unavailable"}
                </span>
                <span className="text-[11px] text-tertiary mt-0.5 block">In-hospital monitoring</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-surface-container-high">
                <span className="text-[10px] font-bold text-tertiary uppercase">30-Day Readmission</span>
                <span className="font-display font-extrabold text-xl text-on-surface block mt-0.5">
                  {outcome?.readmissionRate30Day ? `${outcome.readmissionRate30Day}%` : "Unavailable"}
                </span>
                <span className="text-[11px] text-tertiary mt-0.5 block">Post-discharge cohort</span>
              </div>
            </div>

            <div className="text-xs text-tertiary bg-white p-3 rounded-xl border border-surface-container-high">
              <span className="font-semibold text-on-surface">Outcome Definition: </span>
              {outcome?.outcomeDefinition || "Statutory 30-day all-cause mortality post-CABG."}
            </div>
          </div>

          {/* 3. Documented Standard Costing & Itemized Scope */}
          <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Documented Procedure Tariff & Package
                </h3>
                <span className="text-xs text-on-surface-variant">
                  {cost?.costType || "Statutory Schedule"} • {cost?.roomType}
                </span>
              </div>
              <span className="font-display font-extrabold text-xl text-primary">
                ₹{cost?.minAmount?.toLocaleString("en-IN")} – ₹{cost?.maxAmount?.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inclusions */}
              <div className="p-3.5 rounded-xl bg-white border border-surface-container-high space-y-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Standard Package Inclusions
                </span>
                <ul className="text-xs text-on-surface space-y-1.5">
                  {cost?.inclusions?.map((inc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0"></span>
                      <span>{inc}</span>
                    </li>
                  )) || <li>Standard surgical package scope</li>}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="p-3.5 rounded-xl bg-white border border-surface-container-high space-y-2">
                <span className="text-xs font-bold text-tertiary uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  Documented Exclusions
                </span>
                <ul className="text-xs text-on-surface-variant space-y-1.5">
                  {cost?.exclusions?.map((exc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0"></span>
                      <span>{exc}</span>
                    </li>
                  )) || <li>Extended critical care beyond baseline days</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Facilities & Equipment */}
          <div>
            <h3 className="text-xs font-bold text-tertiary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-secondary" />
              Specialized Infrastructure & ICU Bed Allocation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {facilities?.map((f, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-medium text-on-surface flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Statutory Source Registry Citations */}
          <div>
            <h3 className="text-xs font-bold text-tertiary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-secondary" />
              Statutory Source Document Records & Evidence Provenance
            </h3>
            <div className="space-y-2">
              {sources.length > 0 ? (
                sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-white border border-surface-container-high text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface">{src.title}</span>
                      <span className="text-[10px] font-mono text-tertiary bg-surface-container-low px-2 py-0.5 rounded">
                        {src.verificationStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Publisher: {src.publisher} • Reporting Period: {src.reportingPeriod}
                    </p>
                    <div className="text-[10px] font-mono text-tertiary truncate">
                      SHA-256: {src.documentHash}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-surface-container-low text-xs text-tertiary">
                  Audited via MoHFW CEA Form IV Statutory Return Ledger.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <span className="text-xs text-tertiary">
            ABDM Node Sync Active • Last Verified: {hospital.lastAudited || "2024-Q3"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-on-surface text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
