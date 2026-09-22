import React from "react";
import { Layers, ArrowRight, X } from "lucide-react";

export default function FloatingCompareTray({ queuedHospitals, onClear, onOpenCompare }) {
  if (!queuedHospitals || queuedHospitals.length === 0) return null;

  const names = queuedHospitals.map(h => h.canonicalName).join(" & ");

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-tray rounded-2xl shadow-tray p-3.5 sm:p-4 flex items-center justify-between gap-4 border border-white/80">
        {/* Left side info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-on-surface">
                Comparison Queue
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold">
                {queuedHospitals.length} {queuedHospitals.length === 1 ? "Facility" : "Facilities"} Queued
              </span>
            </div>
            <p className="text-xs text-on-surface-variant truncate">
              {names} ready for side-by-side clinical audit
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-tertiary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            Clear
          </button>

          <button
            onClick={onOpenCompare}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
