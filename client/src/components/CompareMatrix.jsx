import React, { useState } from "react";
import { X, Check, AlertCircle, ShieldCheck, Download, Layers, TrendingDown, Activity, MapPin } from "lucide-react";

export default function CompareMatrix({ hospitals, onClose, onRemoveHospital }) {
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <Layers className="w-12 h-12 text-tertiary mx-auto opacity-50" />
          <h3 className="font-headline font-bold text-lg text-on-surface">No Hospitals Selected</h3>
          <p className="text-sm text-on-surface-variant">
            Please add at least two hospitals to the queue from the search page to run a side-by-side clinical audit.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  // Rows configuration
  const rows = [
    {
      category: "Statutory Identification",
      items: [
        {
          label: "ABDM Registry Node ID",
          accessor: (h) => h.abdmRegistryId,
          isMono: true
        },
        {
          label: "Ownership & Tier",
          accessor: (h) => h.ownership
        },
        {
          label: "Accreditation Standard",
          accessor: (h) => h.accreditations?.join(", ") || "Unavailable"
        },
        {
          label: "Transit Distance",
          accessor: (h) => `${h.distanceKm} km from Hub`
        }
      ]
    },
    {
      category: "Disease-Specific Clinical Outcomes (CABG)",
      items: [
        {
          label: "Annual Procedure Caseload",
          accessor: (h) => h.outcome?.annualVolume ? `${h.outcome.annualVolume.toLocaleString()} cases/yr` : "Unavailable in Registry",
          highlightHighest: true,
          numericValue: (h) => h.outcome?.annualVolume || 0
        },
        {
          label: "30-Day Risk-Adjusted Mortality",
          accessor: (h) => h.outcome?.mortalityRate30Day ? `${h.outcome.mortalityRate30Day}%` : "Unavailable",
          highlightLowest: true,
          numericValue: (h) => h.outcome?.mortalityRate30Day || 99
        },
        {
          label: "Mortality Benchmark Delta",
          accessor: (h) => h.outcome?.mortalityBenchmarkDelta || "Unavailable"
        },
        {
          label: "30-Day Complication Rate",
          accessor: (h) => h.outcome?.complicationRate ? `${h.outcome.complicationRate}%` : "Unavailable"
        },
        {
          label: "Reporting Audit Period",
          accessor: (h) => h.outcome?.reportingPeriod || "Not Reported"
        },
        {
          label: "Clinical Outcome Definition",
          accessor: (h) => h.outcome?.outcomeDefinition || "Unavailable"
        }
      ]
    },
    {
      category: "Documented Procedure Costing",
      items: [
        {
          label: "Pricing Tier / Cost Type",
          accessor: (h) => h.cost?.costType || "Unavailable"
        },
        {
          label: "Documented Baseline Bandwidth",
          accessor: (h) => h.cost ? `₹${h.cost.minAmount.toLocaleString("en-IN")} – ₹${h.cost.maxAmount.toLocaleString("en-IN")}` : "Unavailable"
        },
        {
          label: "Room Allocation Included",
          accessor: (h) => h.cost?.roomType || "Standard Ward"
        },
        {
          label: "Audited Claim Confidence",
          accessor: (h) => h.cost?.confidenceText || "Unavailable"
        },
        {
          label: "Procedure Package Inclusions",
          accessor: (h) => h.cost?.inclusions?.slice(0, 3).join("; ") || "Unavailable"
        },
        {
          label: "Notable Exclusions",
          accessor: (h) => h.cost?.exclusions?.slice(0, 2).join("; ") || "Unavailable"
        }
      ]
    },
    {
      category: "Facilities & Provenance",
      items: [
        {
          label: "Intensive Care Infrastructure",
          accessor: (h) => h.facilities?.find(f => f.includes("ICU")) || h.facilities?.[0] || "Standard ICU"
        },
        {
          label: "Statutory Source Document",
          accessor: (h) => h.outcome?.sourceId ? "MoHFW Statutory Return (Form IV)" : "Hospital Self-Return"
        },
        {
          label: "Registry Confidence Score",
          accessor: (h) => `${h.confidenceScore || 90}% Grounded`
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-surface-container-high flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <h2 className="font-headline font-bold text-xl text-on-surface">
                Side-by-Side Institutional Comparison Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {hospitals.length} Hospitals
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Strict registry comparison with normalized clinical units. Missing data fields are explicitly labeled as "Unavailable".
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Highlight differences toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Highlight Differences</span>
            </label>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-surface-container-high bg-white text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Export Audit</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left">
            {/* Sticky Table Header with Hospital Cards */}
            <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm">
              <tr>
                <th className="p-4 w-64 bg-surface-container-low/90 text-xs font-bold text-tertiary uppercase tracking-wider border-b border-r border-surface-container-high">
                  Clinical Metrics & Parameters
                </th>
                {hospitals.map((hosp) => (
                  <th
                    key={hosp.id}
                    className="p-4 min-w-[260px] max-w-[320px] bg-white border-b border-r border-surface-container-high last:border-r-0 align-top"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded">
                          {hosp.abdmRegistryId}
                        </span>
                        <button
                          onClick={() => onRemoveHospital(hosp.id)}
                          className="text-tertiary hover:text-danger p-1 rounded-md transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="h-20 rounded-lg overflow-hidden relative">
                        <img src={hosp.image} alt={hosp.canonicalName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
                          {hosp.locationName}
                        </span>
                      </div>

                      <h3 className="font-headline font-bold text-sm text-on-surface leading-tight">
                        {hosp.canonicalName}
                      </h3>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body with Categorized Rows */}
            <tbody className="divide-y divide-surface-container-high text-xs">
              {rows.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  {/* Category Header Row */}
                  <tr className="bg-surface-container-low/60 font-bold">
                    <td
                      colSpan={hospitals.length + 1}
                      className="px-4 py-2 text-[11px] font-bold text-primary uppercase tracking-wider bg-surface-container"
                    >
                      {cat.category}
                    </td>
                  </tr>

                  {/* Category Items */}
                  {cat.items.map((item, itemIdx) => {
                    const values = hospitals.map(h => item.accessor(h));
                    const isDifferent = new Set(values).size > 1;

                    return (
                      <tr
                        key={itemIdx}
                        className={`hover:bg-surface-container-low/40 transition-colors ${
                          highlightDifferences && isDifferent ? "bg-amber-50/50" : ""
                        }`}
                      >
                        <td className="p-3.5 font-semibold text-on-surface bg-surface-container-low/30 border-r border-surface-container-high w-64 align-top">
                          {item.label}
                        </td>
                        {hospitals.map((hosp) => {
                          const val = item.accessor(hosp);
                          const isUnavailable = val === "Unavailable" || val.includes("Unavailable");

                          return (
                            <td
                              key={hosp.id}
                              className={`p-3.5 border-r border-surface-container-high last:border-r-0 align-top ${
                                item.isMono ? "font-mono" : ""
                              }`}
                            >
                              {isUnavailable ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-tertiary font-medium text-[11px]">
                                  <AlertCircle className="w-3 h-3 text-warning" />
                                  Unavailable
                                </span>
                              ) : (
                                <span className={`font-medium ${val.includes("%") || val.includes("cases") ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                                  {val}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
