import React from "react";
import { MapPin, TrendingDown, Check, Plus, Bookmark, ShieldCheck, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function HospitalCard({
  hospital,
  isQueued,
  onToggleQueue,
  onOpenDetails
}) {
  const { isAuthenticated, authFetch } = useAuth();
  const [saved, setSaved] = React.useState(false);
  const {
    id,
    canonicalName,
    locationName,
    distanceKm,
    ownership,
    abdmRegistryId,
    accreditationTier,
    image,
    outcome,
    cost
  } = hospital;

  const annualVolume = outcome?.annualVolume ? outcome.annualVolume.toLocaleString() : "Unavailable";
  const mortalityRate = outcome?.mortalityRate30Day ? `${outcome.mortalityRate30Day}%` : "Unavailable";
  const mortalityDelta = outcome?.mortalityBenchmarkDelta || "Standard Clinical Threshold";
  const volumeTag = outcome?.annualVolume > 3000 ? "Highest State Volume" : "MoHFW Verified 2024";

  const minCost = cost ? `₹${(cost.minAmount).toLocaleString("en-IN")}` : "Unavailable";
  const maxCost = cost ? `₹${(cost.maxAmount).toLocaleString("en-IN")}` : "";
  const costRangeText = cost ? `${minCost} – ${maxCost}` : "Registry tariff unavailable";
  const roomTypeText = cost?.roomType || "Standard Ward";
  const confidenceText = cost?.confidenceText || "Based on statutory annual returns";
  const bandwidthPercent = cost?.bandwidthCoverage || 90;

  React.useEffect(() => {
    if (!isAuthenticated) {
      setSaved(false);
      return;
    }
    authFetch("/api/user/saved-hospitals").then(res => res.json()).then(data => {
      if (data.success) setSaved(data.data.some(item => item.hospitalId === id));
    }).catch(() => {});
  }, [authFetch, id, isAuthenticated]);

  const toggleSaved = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("medscout:open-auth"));
      return;
    }
    const response = saved
      ? await authFetch(`/api/user/saved-hospitals/${id}`, { method: "DELETE" })
      : await authFetch("/api/user/saved-hospitals", {
          method: "POST",
          body: JSON.stringify({ hospitalId: id, context: { diseaseId: "dis_cabg", treatmentId: "trt_cabg_onpump" } })
        });
    if (response.ok) setSaved(!saved);
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-surface-container-high shadow-glass hover:shadow-glass-hover transition-all duration-300 overflow-hidden group">
      {/* Top ABDM Badge */}
      <div className="px-4 py-2 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high/60 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-on-surface-variant font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>ABDM: {abdmRegistryId}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-white border border-surface-container-high text-[11px] font-medium text-tertiary">
          {ownership}
        </span>
      </div>

      {/* Hospital Image with Accreditation Overlay */}
      <div className="relative h-44 w-full bg-surface-container overflow-hidden">
        <img
          src={image}
          alt={canonicalName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-[10px] font-bold text-on-surface uppercase tracking-wider shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-secondary" />
            {accreditationTier}
          </span>
          <span className="text-[11px] font-medium text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
            {distanceKm} km away
          </span>
        </div>
      </div>

      {/* Hospital Details & Name */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface leading-tight hover:text-primary transition-colors cursor-pointer" onClick={() => onOpenDetails(hospital)}>
              {canonicalName}
            </h2>
            <button onClick={toggleSaved} title={saved ? "Remove saved hospital" : "Save hospital"} className={`shrink-0 p-2 rounded-lg border ${saved ? "text-secondary border-secondary/30 bg-secondary-container" : "text-tertiary border-surface-container-high hover:text-primary"}`}>
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-1">
            <MapPin className="w-3.5 h-3.5 text-outline shrink-0" />
            <span>{locationName}</span>
          </div>

          {/* Sub-specialty row */}
          <div className="mt-3 py-1 px-2.5 rounded-lg bg-surface-container-low/70 flex items-center justify-between text-xs">
            <span className="text-tertiary font-medium">Matched Sub-specialty:</span>
            <span className="text-primary font-bold">CABG / Adult Cardiac</span>
          </div>

          {/* 2-Column Key Metrics Box */}
          <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-surface-container-high/60">
            {/* Annual Volume */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">
                Annual CABG Volume
              </span>
              <span className="font-display font-extrabold text-xl text-on-surface mt-0.5">
                {annualVolume}
              </span>
              <span className="text-[11px] font-medium text-secondary flex items-center gap-1 mt-0.5">
                <Activity className="w-3 h-3" />
                {volumeTag}
              </span>
            </div>

            {/* 30-Day Mortality */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">
                30-Day Mortality Rate
              </span>
              <span className="font-display font-extrabold text-xl text-on-surface mt-0.5">
                {mortalityRate}
              </span>
              <span className="text-[11px] font-medium text-secondary flex items-center gap-0.5 mt-0.5">
                <TrendingDown className="w-3 h-3 text-secondary" />
                {mortalityDelta}
              </span>
            </div>
          </div>

          {/* Documented Cost Box */}
          <div className="mt-4 p-3 rounded-xl bg-surface-container-low/80 border border-surface-container-high/70 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-tertiary uppercase tracking-wider">
                Documented Standard Package
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-secondary">
                {cost?.confidenceText?.includes("100%") ? "Statutory Public" : "High Confidence"}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-display font-extrabold text-base sm:text-lg text-on-surface">
                {costRangeText}
              </span>
              <span className="text-xs font-medium text-on-surface-variant text-right">
                {roomTypeText}
              </span>
            </div>

            {/* Bandwidth bar */}
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-secondary to-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${bandwidthPercent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-tertiary leading-tight">
              {confidenceText}
            </p>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onToggleQueue(hospital)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isQueued
                ? "bg-secondary text-white shadow-sm"
                : "bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container-high"
            }`}
          >
            {isQueued ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Queued</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Add to Compare</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenDetails(hospital)}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>Clinical Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
