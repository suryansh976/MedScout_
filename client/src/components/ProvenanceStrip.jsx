import React from "react";
import { CheckCircle2, ShieldCheck, Database, Layers } from "lucide-react";

export default function ProvenanceStrip() {
  return (
    <section className="w-full bg-surface-container-low/70 border-y border-surface-container-high/60 py-3.5 px-4 lg:px-8">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Metric summary */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="font-display font-extrabold text-base lg:text-lg text-on-surface">
              142,800+
            </span>
            <span className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">
              Audited Clinical Hospital Episodes Recorded
            </span>
          </div>
        </div>

        {/* Sync Nodes */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs text-on-surface-variant font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-semibold text-on-surface">ABDM HFR</span>
            <span className="text-[11px] text-tertiary">(National Sync v4)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-semibold text-on-surface">MoHFW CEA 2010</span>
            <span className="text-[11px] text-tertiary">(Monthly Stat Audits)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-semibold text-on-surface">PM-JAY NHA</span>
            <span className="text-[11px] text-tertiary">(Standard Package 2.0)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-semibold text-on-surface">NABH & ICMR</span>
            <span className="text-[11px] text-tertiary">(Clinical Safety Nodes)</span>
          </div>
        </div>

        {/* Anti-Sponsorship badge */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-secondary tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Commercial Sponsorship</span>
        </div>
      </div>
    </section>
  );
}
