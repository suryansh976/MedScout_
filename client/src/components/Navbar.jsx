import React from "react";
import { Activity, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AuthModal from "./auth/AuthModal.jsx";
import UserMenu from "./auth/UserMenu.jsx";

export default function Navbar({ activeTab, setActiveTab, queuedCount, onOpenCompare, onOpenChat, onOpenProfile }) {
  const { isAuthenticated, isHospitalAdmin, isVerifier } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  React.useEffect(() => {
    const openAuth = () => setIsAuthModalOpen(true);
    window.addEventListener("medscout:open-auth", openAuth);
    return () => window.removeEventListener("medscout:open-auth", openAuth);
  }, []);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(18,32,51,0.06)]">
      <div className="h-16 w-full px-4 lg:px-8 max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab("discovery")} 
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-on-surface leading-tight tracking-tight">
                MedScout
              </span>
              <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">
                Clinical Evidence
              </span>
            </div>
          </button>

          <div className="h-6 w-px bg-outline-variant/60 hidden xl:block"></div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("discovery")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "discovery"
                  ? "text-primary font-semibold bg-surface-container-low"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60"
              }`}
            >
              Search & Discovery
            </button>

            <button
              onClick={() => {
                setActiveTab("discovery");
                if (queuedCount > 0) onOpenCompare();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "compare"
                  ? "text-primary font-semibold bg-surface-container-low"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60"
              }`}
            >
              <span>Compare Hospitals</span>
              {queuedCount > 0 && (
                <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-primary text-white">
                  {queuedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("protocols")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "protocols"
                  ? "text-primary font-semibold bg-surface-container-low"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60"
              }`}
            >
              Disease Protocols
            </button>

            <button
              onClick={() => setActiveTab("provenance")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "provenance"
                  ? "text-primary font-semibold bg-surface-container-low"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60"
              }`}
            >
              Data Provenance
            </button>

            {isVerifier() && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "admin"
                    ? "text-primary font-semibold bg-surface-container-low"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60"
                }`}
              >
                Admin Verification
              </button>
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* ABDM & MoHFW Synced Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-surface-container-high/60">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              ABDM & MoHFW Synced
            </span>
          </div>

          {/* AI Clinical Guide Trigger */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-secondary-container text-secondary font-semibold text-sm hover:bg-secondary-fixed/70 transition-all shadow-[0_1px_4px_rgba(0,106,106,0.12)] border border-secondary/20"
          >
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            <span>AI Clinical Guide</span>
          </button>

          {/* Clinical Portal */}
          {isHospitalAdmin() && (
            <button
              onClick={() => setActiveTab("admin")}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm"
            >
              <span>Clinical Portal</span>
            </button>
          )}

          {isAuthenticated ? (
            <UserMenu onOpenProfile={onOpenProfile} />
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/5"
            >
              <UserRound className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
