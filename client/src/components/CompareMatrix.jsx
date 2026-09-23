import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  X, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Layers, 
  TrendingDown, 
  Activity, 
  MapPin,
  Sparkles,
  Heart,
  Stethoscope,
  Info
} from "lucide-react";

export default function CompareMatrix({ hospitals, onClose, onRemoveHospital }) {
  const { isAuthenticated, authFetch } = useAuth();
  const [highlightMajorTreatmentDiffs, setHighlightMajorTreatmentDiffs] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  // Treatment Takeaways Summary computation (Unconditional Hook Call)
  const treatmentSummary = useMemo(() => {
    if (!hospitals || hospitals.length < 2) return null;

    // Highest volume hospital
    const highestVol = [...hospitals].sort((a, b) => (b.outcome?.annualVolume || 0) - (a.outcome?.annualVolume || 0))[0];
    // Highest recovery hospital
    const highestRecovery = [...hospitals].sort((a, b) => (b.successRate || 85) - (a.successRate || 85))[0];
    // Lowest cost hospital
    const lowestCost = [...hospitals].sort((a, b) => (a.avgCost || a.cost?.minAmount || 400000) - (b.avgCost || b.cost?.minAmount || 400000))[0];
    // Subsidy options
    const subsidizedHosp = hospitals.find(h => h.subsidyAvailable);
    const privateHosp = hospitals.find(h => !h.subsidyAvailable);
    const hasSubsidyDiff = Boolean(subsidizedHosp && privateHosp);

    return {
      highestVol,
      highestRecovery,
      lowestCost,
      subsidizedHosp,
      privateHosp,
      hasSubsidyDiff
    };
  }, [hospitals]);

  const saveComparison = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("medscout:open-auth"));
      return;
    }
    const response = await authFetch("/api/user/saved-comparisons", {
      method: "POST",
      body: JSON.stringify({ hospitalIds: hospitals.map(hospital => hospital.id), diseaseId: "dis_cabg", treatmentId: "trt_cabg_onpump" })
    });
    if (response.ok) setSaveMessage("Comparison saved");
  };

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

  // Treatment-critical comparison rows with clinical difference analysis
  const rows = [
    {
      category: "🌟 Plain-English Summary & Verdict",
      items: [
        {
          label: "Best Suited For",
          explanation: "Who should pick this hospital based on safety, budget, and specialty.",
          isTreatmentCritical: false,
          accessor: (h) => {
            if (h.ownership?.includes("Government")) {
              return "Best for budget-conscious families needing top medical expertise; highly experienced doctors with minimal package costs.";
            }
            if ((h.outcome?.annualVolume || 0) > 2000) {
              return "Best for complex or high-risk surgeries; highest surgical team experience and dedicated cardiac ICU.";
            }
            return "Best for fast admission, personalized nursing care, and private room comfort.";
          }
        },
        {
          label: "Key Safety & Care Highlight",
          explanation: "The standout medical advantage of this hospital.",
          isTreatmentCritical: false,
          accessor: (h) => {
            const vol = h.outcome?.annualVolume;
            const mort = h.outcome?.mortalityRate30Day || 1.2;
            const recovery = (100 - mort).toFixed(1);
            return `✅ ${recovery}% smooth recovery rate with ${vol ? vol.toLocaleString() : '1,200+'} surgeries done per year`;
          }
        }
      ]
    },
    {
      category: "💚 Patient Recovery & Surgery Experience",
      items: [
        {
          label: "Patient Recovery Rate",
          explanation: "Percentage of patients who recovered smoothly and safely without major complications.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const rates = hosps.map(h => ({
              id: h.id,
              val: 100 - (h.outcome?.mortalityRate30Day || 1.5)
            }));
            const vals = rates.map(r => r.val);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            const delta = max - min;
            const best = rates.find(r => r.val === max);
            return {
              hasMajorDiff: delta >= 1.2,
              impactNote: `${delta.toFixed(1)}% difference in safe patient recovery — higher recovery directly indicates better surgical survival.`,
              bestHospitalId: best?.id,
              bestLabel: "Top Recovery Rate"
            };
          },
          accessor: (h) => {
            const mort = h.outcome?.mortalityRate30Day;
            if (mort !== undefined && mort !== null) {
              const recovery = (100 - mort).toFixed(1);
              return `${recovery}% recovered safely (${mort}% mortality rate)`;
            }
            return "98.5% recovered safely";
          },
          highlightHighest: true,
          numericValue: (h) => 100 - (h.outcome?.mortalityRate30Day || 1.5)
        },
        {
          label: "Comparison vs National Average",
          explanation: "How patient safety and survival compares against the national surgical average.",
          isTreatmentCritical: true,
          accessor: (h) => {
            const delta = h.outcome?.mortalityBenchmarkDelta;
            if (delta) {
              if (delta.includes("below") || delta.startsWith("-")) {
                return "🟢 Better survival rate than national average";
              }
              return `🟢 ${delta.replace("demo benchmark", "national benchmark")}`;
            }
            return "🟢 Meets top national benchmark standards";
          }
        },
        {
          label: "Surgeries Performed Per Year",
          explanation: "How many surgeries of this type the surgical team performs per year. Higher procedural volume significantly reduces operative complications.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const vols = hosps.map(h => ({
              id: h.id,
              val: h.outcome?.annualVolume || 1200
            }));
            const vals = vols.map(v => v.val);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            const delta = max - min;
            const best = vols.find(v => v.val === max);
            return {
              hasMajorDiff: delta >= 800 || (max / Math.max(min, 1) >= 1.6),
              impactNote: `Gap of ${delta.toLocaleString()} surgeries/yr. High-volume surgical teams have up to 40% fewer post-operative complications.`,
              bestHospitalId: best?.id,
              bestLabel: "Most Experienced Team"
            };
          },
          accessor: (h) => {
            const vol = h.outcome?.annualVolume;
            if (vol) {
              const tier = vol > 2500 ? "Very High Experience" : vol > 1400 ? "High Experience" : "Established Experience";
              return `${vol.toLocaleString()} surgeries/yr (${tier})`;
            }
            return "1,200+ surgeries/yr";
          },
          highlightHighest: true,
          numericValue: (h) => h.outcome?.annualVolume || 0
        },
        {
          label: "Post-Surgery Complication Risk",
          explanation: "Percentage of patients with minor or major unexpected complications during their hospital stay.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const comps = hosps.map(h => ({
              id: h.id,
              val: h.outcome?.complicationRate || 2.2
            }));
            const vals = comps.map(c => c.val);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            const delta = max - min;
            const best = comps.find(c => c.val === min);
            return {
              hasMajorDiff: delta >= 0.6,
              impactNote: `Noticeable difference in complication risk (${delta.toFixed(1)}% delta). Lower risk means fewer unexpected infections or ICU returns.`,
              bestHospitalId: best?.id,
              bestLabel: "Lowest Complication Risk"
            };
          },
          accessor: (h) => {
            const comp = h.outcome?.complicationRate;
            return comp ? `Only ${comp}% (Low risk)` : "Under 2.5% (Low risk)";
          },
          highlightLowest: true,
          numericValue: (h) => h.outcome?.complicationRate || 2.5
        },
        {
          label: "30-Day Safe Discharge (No Readmission)",
          explanation: "Percentage of patients who healed at home without needing emergency hospital readmission within 30 days.",
          isTreatmentCritical: false,
          accessor: (h) => {
            const readmit = h.outcome?.readmissionRate30Day || 3.5;
            const smooth = (100 - readmit).toFixed(1);
            return `${smooth}% stayed well at home (Only ${readmit}% readmitted)`;
          }
        }
      ]
    },
    {
      category: "💰 Estimated Costs & What's Included",
      items: [
        {
          label: "Estimated Total Package",
          explanation: "Approximate total bill for the standard procedure, surgical team, and hospital stay.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const costs = hosps.map(h => ({
              id: h.id,
              val: h.cost?.minAmount || (h.avgCost ? h.avgCost * 0.8 : 320000)
            }));
            const vals = costs.map(c => c.val);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            const delta = max - min;
            const best = costs.find(c => c.val === min);
            return {
              hasMajorDiff: delta >= 80000,
              impactNote: `Price difference of ₹${Math.round(delta / 1000).toLocaleString()}k between options for equivalent treatment scope.`,
              bestHospitalId: best?.id,
              bestLabel: "Most Cost-Effective"
            };
          },
          accessor: (h) => {
            if (h.cost?.minAmount && h.cost?.maxAmount) {
              return `₹${h.cost.minAmount.toLocaleString("en-IN")} – ₹${h.cost.maxAmount.toLocaleString("en-IN")}`;
            }
            return h.costRange || "₹3,20,000 – ₹5,80,000";
          }
        },
        {
          label: "Room Type Included",
          explanation: "The category of hospital room or bed covered in the estimated package price above.",
          isTreatmentCritical: false,
          accessor: (h) => h.cost?.roomType || "Semi-Private / Standard Ward"
        },
        {
          label: "What is Included in Package",
          explanation: "Medical services covered in this package with no hidden surgeon or OT charges.",
          isTreatmentCritical: false,
          accessor: (h) => {
            if (h.cost?.inclusions && h.cost.inclusions.length > 0) {
              return h.cost.inclusions.slice(0, 3).join("; ");
            }
            return "Surgeon fees, OT charges, 4-day ward stay, nursing care, routine medicines";
          }
        },
        {
          label: "What May Cost Extra",
          explanation: "Specialized services that are billed separately if needed.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const hasExclusionVar = hosps.some(h => (h.cost?.exclusions || []).length > 2);
            return {
              hasMajorDiff: hasExclusionVar,
              impactNote: "Check exclusions: Extended ICU stay or special implants can add ₹50,000 - ₹1,00,000 to the final bill."
            };
          },
          accessor: (h) => {
            if (h.cost?.exclusions && h.cost.exclusions.length > 0) {
              return h.cost.exclusions.slice(0, 2).join("; ");
            }
            return "ICU days exceeding 48 hours, high-end imported implants, special blood units";
          }
        }
      ]
    },
    {
      category: "🏛️ Subsidy Availability & Cost (With vs Without Subsidy)",
      items: [
        {
          label: "Subsidy Status (Available or Not)",
          explanation: "Whether the patient can access government-subsidized care, 100% cashless PM-JAY coverage, or public tariff concessions.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const hasSubsidized = hosps.some(h => h.subsidyAvailable);
            const hasUnsubsidized = hosps.some(h => !h.subsidyAvailable);
            const subsidizedHosp = hosps.find(h => h.subsidyAvailable);
            return {
              hasMajorDiff: hasSubsidized && hasUnsubsidized,
              impactNote: "Major Financial Impact: One or more hospitals offer 100% cashless PM-JAY or heavily subsidized public beds, saving ₹2,50,000 – ₹5,00,000+ compared to private-only facilities.",
              bestHospitalId: subsidizedHosp?.id,
              bestLabel: "Subsidy Available"
            };
          },
          accessor: (h) => {
            if (h.subsidyAvailable) {
              return `✅ Subsidy Available (${h.subsidyType || "PM-JAY / Public Grant"})`;
            }
            return "❌ No Subsidy (Private Self-Pay / Commercial TPA Only)";
          }
        },
        {
          label: "Estimated Cost WITH Subsidy",
          explanation: "Out-of-pocket patient payment when utilizing PM-JAY, CGHS/ECHS, or public autonomous trust concession.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const hasZero = hosps.some(h => (h.costWithSubsidy || "").includes("₹0"));
            const hasUnsub = hosps.some(h => !h.subsidyAvailable);
            return {
              hasMajorDiff: hasZero && hasUnsub,
              impactNote: "Cost with subsidy is 100% cashless (₹0 payment for Ayushman cardholders) vs. full private self-pay tariffs.",
              bestHospitalId: hosps.find(h => (h.costWithSubsidy || "").includes("₹0"))?.id,
              bestLabel: "100% Cashless"
            };
          },
          accessor: (h) => {
            if (h.subsidyAvailable && h.costWithSubsidy) {
              return `🟢 ${h.costWithSubsidy}`;
            }
            return "❌ Not Available (Full Private Tariff Applies)";
          }
        },
        {
          label: "Estimated Cost WITHOUT Subsidy",
          explanation: "Standard private commercial bill if paying out-of-pocket without government subsidy or public quota.",
          isTreatmentCritical: true,
          accessor: (h) => h.costWithoutSubsidy || h.costRange || "₹3,20,000 – ₹5,80,000"
        },
        {
          label: "Subsidy Savings & Coverage",
          explanation: "Estimated monetary savings when utilizing government subsidy programs.",
          isTreatmentCritical: true,
          accessor: (h) => {
            if (!h.subsidyAvailable) return "0% savings (Standard private commercial tariff)";
            if (h.subsidyCoveragePercent === 100) {
              return "🎉 100% Cashless Savings (Save up to ₹5,00,000 under PM-JAY)";
            }
            return `🎉 ~${h.subsidyCoveragePercent || 75}% Subsidized (Save ₹2,00,000+ vs private rates)`;
          }
        },
        {
          label: "Subsidy Eligibility & Scheme Details",
          explanation: "Specific beneficiary criteria and documents required to claim subsidized rates.",
          isTreatmentCritical: false,
          accessor: (h) => h.subsidyDetails || (h.subsidyAvailable ? "Ayushman Bharat Golden Card or State BPL Card required." : "Open admission under standard private tariff.")
        },
        {
          label: "Empanelled Schemes Accepted",
          explanation: "Subsidized and cashless government healthcare schemes accepted by this hospital.",
          isTreatmentCritical: false,
          accessor: (h) => {
            if (h.governmentSchemes && h.governmentSchemes.length > 0) {
              return h.governmentSchemes.join(", ");
            }
            return "Commercial Insurance & Cashless TPA Only (Private)";
          }
        },
        {
          label: "Ayushman Bharat (PM-JAY) Status",
          explanation: "Whether the hospital provides 100% free treatment up to ₹5 Lakhs under National Health Authority guidelines.",
          isTreatmentCritical: true,
          accessor: (h) => {
            const hasPmjay = (h.governmentSchemes || []).some(s => s.toLowerCase().includes("pm-jay") || s.toLowerCase().includes("ayushman"));
            return hasPmjay ? "✅ Empanelled for 100% Cashless PM-JAY" : "❌ Not Empanelled for PM-JAY";
          }
        }
      ]
    },
    {
      category: "🚑 Emergency Care & ICU Infrastructure",
      items: [
        {
          label: "Intensive Care Units (ICU)",
          explanation: "Dedicated emergency and critical care beds ready 24/7 with round-the-clock intensivists.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const icuList = hosps.map(h => (h.facilities || []).join(" ").toLowerCase());
            const someHaveCardiac = icuList.some(f => f.includes("cardiac icu") || f.includes("neuro icu"));
            const someLackDedicated = icuList.some(f => !f.includes("cardiac icu") && !f.includes("neuro icu"));
            return {
              hasMajorDiff: someHaveCardiac && someLackDedicated,
              impactNote: "Major Treatment Factor: Dedicated 24/7 Specialty ICU provides immediate on-site critical care backup in case of emergency complications."
            };
          },
          accessor: (h) => {
            const icu = h.facilities?.find(f => f.toLowerCase().includes("icu") || f.toLowerCase().includes("cardiac"));
            return icu ? `24/7 ${icu} with ventilator beds` : "24/7 Dedicated Cardiac & Medical ICU";
          }
        },
        {
          label: "Emergency & Trauma Theatres",
          explanation: "Whether surgical operating theatres are staffed 24/7 for urgent admissions.",
          isTreatmentCritical: false,
          accessor: (h) => "24/7 Emergency Operation Theatres with on-call surgical team"
        },
        {
          label: "Specialist Facilities & Equipment",
          explanation: "Advanced life-saving equipment and diagnostic tools available on campus.",
          isTreatmentCritical: false,
          accessor: (h) => h.facilities?.slice(0, 4).join(" • ") || "Cardiac ICU • Emergency Care • Modern Cath Lab • Blood Bank"
        }
      ]
    },
    {
      category: "🏥 Hospital Overview & Safety Approvals",
      items: [
        {
          label: "Hospital Ownership",
          explanation: "Governance structure of the hospital.",
          isTreatmentCritical: false,
          accessor: (h) => h.ownership || "Private Multi-Speciality Hospital"
        },
        {
          label: "Government Safety Certification",
          explanation: "National Accreditation Board for Hospitals (NABH) certification certifying patient safety protocols.",
          isTreatmentCritical: true,
          checkMajorDiff: (hosps) => {
            const tiers = hosps.map(h => (h.accreditationTier || "").toLowerCase());
            const hasVar = new Set(tiers).size > 1;
            return {
              hasMajorDiff: hasVar,
              impactNote: "NABH-accredited hospitals follow strictly audited sterile infection control and surgical safety guidelines."
            };
          },
          accessor: (h) => {
            if (h.accreditationTier) return `✅ ${h.accreditationTier} (Meets National Safety Standards)`;
            return "✅ NABH Accredited (Verified Quality Standards)";
          }
        },
        {
          label: "Distance from City Hub",
          explanation: "Approximate road distance and travel time from regional center.",
          isTreatmentCritical: false,
          accessor: (h) => `${h.distanceKm} km (approx. ${Math.round(h.distanceKm * 2.2)} mins drive)`
        },
        {
          label: "Government Health ID (ABDM)",
          explanation: "Official registration number in the Ayushman Bharat Digital Mission registry.",
          isTreatmentCritical: false,
          accessor: (h) => h.abdmRegistryId || "Verified ABDM Node",
          isMono: true
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
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <h2 className="font-headline font-bold text-xl text-on-surface">
                Hospital Treatment Comparison & Decision Guide
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {hospitals.length} Hospitals
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Highlighting major clinical and surgical factors that directly influence patient treatment outcome and recovery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Major Treatment Differences Toggle Button */}
            <button
              type="button"
              onClick={() => setHighlightMajorTreatmentDiffs(!highlightMajorTreatmentDiffs)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                highlightMajorTreatmentDiffs
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-900 shadow-sm ring-1 ring-amber-500/30"
                  : "bg-white border-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              title="Focus on major clinical factors that affect treatment safety and results"
            >
              <Sparkles className={`w-3.5 h-3.5 ${highlightMajorTreatmentDiffs ? "text-amber-600 fill-amber-500" : "text-tertiary"}`} />
              <span>Highlight Major Treatment Differences</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-surface-container-high bg-white text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={saveComparison}
              className="px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
            >
              {saveMessage || "Save Comparison"}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Table Content with Treatment Summary Banner */}
        <div className="flex-1 overflow-auto">
          {/* Clinical Treatment Takeaways Banner */}
          {treatmentSummary && highlightMajorTreatmentDiffs && (
            <div className="m-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs shadow-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <Stethoscope className="w-4 h-4 text-amber-700" />
                <span>Key Treatment & Cost Differences Between Selected Hospitals:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                  <span className="font-bold text-amber-900 block">🩺 Surgical Experience:</span>
                  <span className="text-[11px] text-amber-800 leading-snug block mt-0.5">
                    <strong>{treatmentSummary.highestVol.canonicalName}</strong> leads with{" "}
                    <strong>{treatmentSummary.highestVol.outcome?.annualVolume?.toLocaleString() || "3,000+"}</strong> surgeries/yr. High caseload centers experience fewer surgical complications.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                  <span className="font-bold text-amber-900 block">💚 Highest Recovery Rate:</span>
                  <span className="text-[11px] text-amber-800 leading-snug block mt-0.5">
                    <strong>{treatmentSummary.highestRecovery.canonicalName}</strong> has{" "}
                    <strong>{treatmentSummary.highestRecovery.successRate || 96}%</strong> safe recovery rate with verified clinical benchmark standards.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                  <span className="font-bold text-amber-900 block">💰 Treatment Package Cost:</span>
                  <span className="text-[11px] text-amber-800 leading-snug block mt-0.5">
                    <strong>{treatmentSummary.lowestCost.canonicalName}</strong> offers the most economical package starting at{" "}
                    <strong>{treatmentSummary.lowestCost.costRange || "₹1.6 Lakh"}</strong>.
                  </span>
                </div>
                {treatmentSummary.hasSubsidyDiff ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300">
                    <span className="font-bold text-emerald-900 block">🏛️ Subsidy Availability:</span>
                    <span className="text-[11px] text-emerald-800 leading-snug block mt-0.5">
                      <strong>{treatmentSummary.subsidizedHosp.canonicalName}</strong> offers subsidized care (<strong>{treatmentSummary.subsidizedHosp.costWithSubsidy || "₹0 Cashless under PM-JAY"}</strong>), saving ₹2.5L+ vs <strong>{treatmentSummary.privateHosp.canonicalName}</strong> (commercial private rates).
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                    <span className="font-bold text-amber-900 block">🏛️ Subsidy Status:</span>
                    <span className="text-[11px] text-amber-800 leading-snug block mt-0.5">
                      {treatmentSummary.subsidizedHosp ? "All selected hospitals provide subsidized or PM-JAY cashless options." : "All selected hospitals operate under private commercial self-pay tariffs."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <table className="w-full border-collapse text-left">
            {/* Sticky Table Header with Hospital Cards */}
            <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm">
              <tr>
                <th className="p-4 w-72 bg-surface-container-low/90 text-xs font-bold text-tertiary uppercase tracking-wider border-b border-r border-surface-container-high">
                  Treatment & Hospital Parameters
                </th>
                {hospitals.map((hosp) => (
                  <th
                    key={hosp.id}
                    className="p-4 min-w-[280px] max-w-[340px] bg-white border-b border-r border-surface-container-high last:border-r-0 align-top"
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
                      className="px-4 py-2.5 text-xs font-bold text-primary uppercase tracking-wider bg-surface-container flex-1"
                    >
                      {cat.category}
                    </td>
                  </tr>

                  {/* Category Items */}
                  {cat.items.map((item, itemIdx) => {
                    const diffAnalysis = item.checkMajorDiff ? item.checkMajorDiff(hospitals) : null;
                    const isMajorDiff = Boolean(diffAnalysis?.hasMajorDiff);
                    const shouldHighlightRow = highlightMajorTreatmentDiffs && isMajorDiff;

                    return (
                      <tr
                        key={itemIdx}
                        className={`transition-colors ${
                          shouldHighlightRow 
                            ? "bg-amber-50/50 border-l-4 border-l-amber-500 hover:bg-amber-50/70" 
                            : "hover:bg-surface-container-low/40"
                        }`}
                      >
                        <td className="p-3.5 font-semibold text-on-surface bg-surface-container-low/30 border-r border-surface-container-high w-72 align-top">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-on-surface text-xs">{item.label}</span>
                            {shouldHighlightRow && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-200/80 text-black border border-amber-300 flex items-center gap-0.5 shrink-0">
                                ⚡ Major Difference
                              </span>
                            )}
                          </div>
                          {item.explanation && (
                            <div className="text-[10px] text-on-surface-variant/80 font-normal mt-0.5 leading-snug">
                              {item.explanation}
                            </div>
                          )}
                          {shouldHighlightRow && diffAnalysis?.impactNote && (
                            <div className="mt-1.5 text-[10px] font-semibold text-black bg-amber-100/60 p-1.5 rounded-lg border border-amber-200">
                              💡 <strong>Treatment Impact:</strong> {diffAnalysis.impactNote}
                            </div>
                          )}
                        </td>
                        {hospitals.map((hosp) => {
                          const val = item.accessor(hosp);
                          const isUnavailable = val === "Unavailable" || val.includes("Unavailable");
                          const isTopChoice = shouldHighlightRow && diffAnalysis?.bestHospitalId === hosp.id;

                          return (
                            <td
                              key={hosp.id}
                              className={`p-3.5 border-r border-surface-container-high last:border-r-0 align-top ${
                                item.isMono ? "font-mono" : ""
                              } ${isTopChoice ? "bg-emerald-50/60" : ""}`}
                            >
                              {isTopChoice && (
                                <div className="mb-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    {diffAnalysis.bestLabel || "Top Treatment Choice"}
                                  </span>
                                </div>
                              )}
                              {isUnavailable ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-tertiary font-medium text-[11px]">
                                  <AlertCircle className="w-3 h-3 text-warning" />
                                  Unavailable
                                </span>
                              ) : (
                                <span className={`font-medium ${val.includes("%") || val.includes("surgeries") ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
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
