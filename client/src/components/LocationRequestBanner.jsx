import React from "react";
import { Navigation, MapPin, ShieldCheck, Lock, Globe2, X, Sparkles } from "lucide-react";

export default function LocationRequestBanner({
  onDetectGps,
  isDetectingGps,
  onSelectCity,
  onOpenLogin,
  onBrowseAllIndia,
  onClose
}) {
  const topHubs = [
    "Delhi NCR",
    "Mumbai",
    "Bengaluru",
    "Chandigarh",
    "Kolkata",
    "Chennai",
    "Hyderabad",
    "Pune",
    "Lucknow",
    "Jaipur"
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 pt-4 pb-2">
      <div className="relative rounded-2xl bg-gradient-to-r from-surface-container-low via-white to-primary-fixed/20 border border-primary/20 shadow-glass p-5 sm:p-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-secondary-fixed/30 blur-2xl pointer-events-none"></div>

        {/* Close / Dismiss button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-tertiary hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Dismiss location prompt"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Column: Privacy Explanation */}
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Privacy-Protected Healthcare Search</span>
            </div>

            <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Set Your Location or Log In to View Nearby Hospitals</span>
            </h3>

            <p className="text-xs sm:text-sm text-tertiary leading-relaxed">
              MedScout respects your privacy: we do not display nearby facilities or calculate driving distances without your permission.
              Detect your location via GPS, pick your healthcare hub, or log in with your account to see verified facilities near you.
            </p>
          </div>

          {/* Right Column: Primary Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onDetectGps}
              disabled={isDetectingGps}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all disabled:opacity-60"
            >
              <Navigation className={`w-4 h-4 ${isDetectingGps ? "animate-spin" : ""}`} />
              <span>{isDetectingGps ? "Detecting GPS..." : "Detect Current Location"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-surface-container-low text-on-surface font-semibold text-xs border border-surface-container-high flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-secondary" />
              <span>Log In with ABHA / Account</span>
            </button>

            <button
              type="button"
              onClick={onBrowseAllIndia}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-tertiary hover:text-on-surface hover:bg-surface-container-low font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Browse All India</span>
            </button>
          </div>
        </div>

        {/* Quick Hub Selector Pills */}
        <div className="mt-4 pt-3.5 border-t border-surface-container-high/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-tertiary uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-secondary" />
            Or select your hub:
          </span>
          {topHubs.map(hub => (
            <button
              key={hub}
              type="button"
              onClick={() => onSelectCity(hub)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-primary hover:text-white border border-surface-container-high text-on-surface transition-all shadow-xs"
            >
              {hub}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
