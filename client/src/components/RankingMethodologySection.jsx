import React from "react";
import { ShieldCheck, CheckSquare, Layers, Activity, FileSpreadsheet, Navigation, ArrowRight } from "lucide-react";

export default function RankingMethodologySection({ onReadMethodology }) {
  const tiers = [
    {
      step: "01 / BASELINE",
      icon: CheckSquare,
      title: "Must be officially registered — no exceptions",
      description: "We check active registration in the national ABDM Health Facility Registry (HFR) and applicable establishment rules.",
      tag: "Required first",
      isGate: true
    },
    {
      step: "02 / EVIDENCE",
      icon: Layers,
      title: "Disease Evidence Quality",
      description: "ICMR registry alignment, NABH specialized clinical nursing ratios, and ICU bed availability for specific disease paths.",
      tag: "Weight: 30%",
      isGate: false
    },
    {
      step: "03 / OUTCOMES",
      icon: Activity,
      title: "Proven Track Record",
      description: "Documented annual caseload thresholds. Higher specific case volume strongly correlates with lower complication incidence.",
      tag: "Weight: 30%",
      isGate: false
    },
    {
      step: "04 / INTEGRITY",
      icon: FileSpreadsheet,
      title: "Honest Pricing",
      description: "Transparent standard package rates vs final billing consistency audited via PM-JAY claim databases and commercial TPAs.",
      tag: "Weight: 25%",
      isGate: false
    },
    {
      step: "05 / ACCESS",
      icon: Navigation,
      title: "Geographic Access & Beds",
      description: "Calculated transit proximity, emergency ICU transit accessibility, and real-time public bed availability telemetry.",
      tag: "Weight: 15%",
      isGate: false
    }
  ];

  return (
    <section className="w-full bg-surface-container-low/50 py-16 px-4 lg:px-8 border-t border-surface-container-high/60">
      <div className="max-w-[1440px] mx-auto space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block">
            MedScout Audit Standards
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface tracking-tight">
            How We Rank Hospitals
          </h2>
          <p className="text-sm sm:text-base text-tertiary leading-relaxed">
            Commercial hospital discovery engines monetize sponsored priority placements. MedScout enforces an uncompromised 5-tier open-source algorithm based strictly on documented health registries.
          </p>
        </div>

        {/* 5-Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-surface-container-high shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary font-mono uppercase tracking-wider">
                      {tier.step}
                    </span>
                    <Icon className="w-4 h-4 text-secondary" />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-on-surface leading-tight">
                    {tier.title}
                  </h3>
                  <p className="text-xs text-tertiary leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-container-high/60">
                  <span className={`text-[11px] font-semibold ${tier.isGate ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                    {tier.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statutory Anti-Advertising Pledge Banner */}
        <div className="rounded-2xl bg-white p-5 lg:p-6 border border-surface-container-high shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                Our Promise: No Paid Rankings
              </h3>
              <p className="text-xs text-tertiary">
                No hospital or healthcare corporation can purchase priority ranking, promote listings, or edit registry records on MedScout.
              </p>
            </div>
          </div>

          <button
            onClick={onReadMethodology}
            className="px-5 py-2.5 rounded-xl border border-surface-container-high hover:border-primary bg-surface-container-low hover:bg-white text-on-surface font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0"
          >
            <span>Read Audit Methodology v4.2</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>
    </section>
  );
}
