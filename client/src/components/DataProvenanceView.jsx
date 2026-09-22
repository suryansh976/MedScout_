import React, { useState, useEffect } from "react";
import { ShieldCheck, FileText, ExternalLink, CheckCircle2, Lock, Database } from "lucide-react";

export default function DataProvenanceView() {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetch("/api/sources")
      .then(res => res.json())
      .then(data => {
        if (data.success) setSources(data.data);
      })
      .catch(err => console.error("Error fetching sources", err));
  }, []);

  const standards = [
    {
      title: "ABDM Health Facility Registry (HFR)",
      authority: "National Health Authority (NHA) / ABDM",
      description: "Comprehensive national repository of public and private hospitals, clinics, diagnostic centers, and teaching institutes with unique facility identifiers.",
      url: "https://ahpr.abdm.gov.in/about"
    },
    {
      title: "MoHFW Clinical Establishments Act (CEA 2010)",
      authority: "Ministry of Health & Family Welfare",
      description: "Statutory framework governing establishment standards, monthly statistics returns (OPD/IPD volume, deaths, bed capacity), and transparent procedure rate disclosures.",
      url: "https://clinicalestablishments.mohfw.gov.in/en/download"
    },
    {
      title: "Ayushman Bharat PM-JAY Health Benefit Packages",
      authority: "National Health Authority",
      description: "Standardized clinical procedure package rates covering bed stay, nursing, professional fees, anesthesia, surgical consumables, implants, and diagnostics.",
      url: "https://nha.gov.in/img/pmjay-files/RFE_Volume_II.pdf"
    },
    {
      title: "NABH Hospital Accreditation (5th Edition)",
      authority: "Quality Council of India (QCI)",
      description: "Clinical patient safety framework evaluating infection control protocols, nurse-to-patient staffing ratios, medication safety, and continuous quality improvement.",
      url: "https://portal.nabh.co/standard.aspx"
    },
    {
      title: "ICMR Clinical Trials & Oncology Register",
      authority: "Indian Council of Medical Research",
      description: "Central validation node for multicentric therapeutic trials, cell therapy efficacy data, and cancer registry statistics.",
      url: "https://www.icmr.gov.in/icmr-portals?q=clinical+trial"
    }
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest block">
          Institutional Governance & Transparency
        </span>
        <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
          Data Provenance & Verification Architecture
        </h1>
        <p className="text-sm text-tertiary leading-relaxed">
          Every clinical outcome metric, procedural volume count, and cost range displayed on MedScout is strictly mapped to verifiable government returns, hospital statutory filings, and accredited third-party clinical audits.
        </p>
      </div>

      {/* Official Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {standards.map((std, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-surface-container-high shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded uppercase">
                {std.authority}
              </span>
              <h3 className="font-headline font-bold text-base text-on-surface">
                {std.title}
              </h3>
              <p className="text-xs text-tertiary leading-relaxed">
                {std.description}
              </p>
            </div>

            <a
              href={std.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 pt-2 border-t border-surface-container-high/60"
            >
              <span>Explore Official Guidelines</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Statutory Source Documents Ledger */}
      <div className="bg-white rounded-2xl p-6 border border-surface-container-high shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-secondary" />
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Audited Source Documents in Active Registry
          </h2>
        </div>

        <div className="space-y-3">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-bold text-sm text-on-surface">{src.title}</span>
                </div>
                <p className="text-tertiary">
                  Publisher: {src.publisher} • Reporting Period: {src.reportingPeriod}
                </p>
                <div className="font-mono text-[10px] text-tertiary">
                  Integrity Hash: {src.documentHash}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-white border border-surface-container-high text-[11px] font-bold text-secondary">
                  {src.verificationStatus}
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1"
                >
                  <span>PDF Reference</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
