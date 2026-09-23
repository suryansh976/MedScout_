import React from "react";
import { Activity, ShieldCheck } from "lucide-react";

export default function Footer({ onNavigateTab }) {
  return (
    <footer className="w-full bg-white border-t border-surface-container-high py-12 px-4 lg:px-8 text-xs">
      <div className="max-w-[1440px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-headline font-bold text-base text-on-surface">MedScout</span>
            </div>
            <p className="text-tertiary leading-relaxed max-w-lg">
              Our data comes from official government health sources including ABDM, PM-JAY, and NABH. This is not an emergency medical service — in an emergency, call 108.
            </p>
          </div>

          {/* Governance Col */}
          <div className="space-y-2.5">
            <span className="font-bold text-tertiary uppercase tracking-wider block text-[11px]">
              How We Verify Data
            </span>
            <ul className="space-y-2 text-on-surface-variant">
              <li>
                <button onClick={() => onNavigateTab("provenance")} className="hover:text-primary transition-colors">
                  Ranking Methodology
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("admin")} className="hover:text-primary transition-colors">
                  Verification Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("provenance")} className="hover:text-primary transition-colors">
                  Registry Disclosures
                </button>
              </li>
            </ul>
          </div>

          {/* Stakeholders Col */}
          <div className="space-y-2.5">
            <span className="font-bold text-tertiary uppercase tracking-wider block text-[11px]">
              About
            </span>
            <ul className="space-y-2 text-on-surface-variant">
              <li>
                <button onClick={() => onNavigateTab("protocols")} className="hover:text-primary transition-colors">
                  Researchers & Bio-Stats
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("admin")} className="hover:text-primary transition-colors">
                  Hospital Administrators
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("provenance")} className="hover:text-primary transition-colors">
                  Patient Charter & Rights
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-tertiary">
          <p>© 2025 MedScout Evidence Platform. Statutory Data Model version 4.2. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Verified ICMR Node
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              NABH Accr. Reference #90412
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              PM-JAY Standard Packages 2.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
