import React, { useEffect, useState } from "react";
import { BadgeCheck, ExternalLink, Link2, LockKeyhole, MapPin, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function HealthCardPage({ onOpenChat }) {
  const { isAuthenticated, user, authFetch } = useAuth();
  const [profile, setProfile] = useState(user);
  const [preferences, setPreferences] = useState({});
  const [savedHospitals, setSavedHospitals] = useState([]);
  const [showQr, setShowQr] = useState(false);
  const [abhaStatus, setAbhaStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      authFetch("/api/user/profile").then(response => response.json()),
      authFetch("/api/user/preferences").then(response => response.json()),
      authFetch("/api/user/saved-hospitals").then(response => response.json())
      , authFetch("/api/user/abha/status").then(response => response.json())
    ]).then(([profileResponse, preferenceResponse, savedResponse, abhaResponse]) => {
      if (profileResponse.success) setProfile(profileResponse.data);
      if (preferenceResponse.success) setPreferences(preferenceResponse.data);
      if (savedResponse.success) setSavedHospitals(savedResponse.data);
      if (abhaResponse.success) setAbhaStatus(abhaResponse.data);
    }).catch(() => {});
  }, [authFetch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex min-h-[65vh] w-full max-w-[900px] items-center justify-center px-4 py-12 lg:px-8">
        <div className="w-full rounded-2xl border border-surface-container-high bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-12 w-12 text-secondary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-secondary">Discovery Card</p>
          <h1 className="mt-2 font-headline text-3xl font-bold text-on-surface">Sign in to build your My Health Card</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-on-surface-variant">Save your location, treatment budget, preferred distance, and hospitals so the AI assistant can use your context.</p>
          <button onClick={() => window.dispatchEvent(new CustomEvent("medscout:open-auth"))} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Sign in</button>
        </div>
      </section>
    );
  }

  const location = preferences.location?.value || profile?.preferredCity || "Add a preferred location";
  const budget = preferences.budget?.max ? `₹${Number(preferences.budget.max).toLocaleString("en-IN")}` : "No budget set";
  const radius = preferences.maxDistance?.value ? `${preferences.maxDistance.value} km` : "No radius set";
  const cardToken = `MSC-${String(profile?.id || "guest").slice(-8).toUpperCase()}`;

  return (
    <section className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-8 lg:px-8">
      <header className="border-b border-surface-container-high pb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">Personal context</p>
        <h1 className="mt-1 font-headline text-3xl font-bold text-on-surface">My Health Card</h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">A private discovery profile for better hospital searches. It is not a government health ID and does not store medical records.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg">
          <div className="flex items-start justify-between gap-4 p-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70"><Sparkles className="h-4 w-4" /> MedScout</div>
              <h2 className="mt-8 font-headline text-2xl font-bold">{profile?.name || "Your discovery profile"}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80"><MapPin className="h-4 w-4" /> {location}</p>
            </div>
            <BadgeCheck className="h-8 w-8 text-secondary-fixed" />
          </div>
          <div className="grid grid-cols-2 gap-px border-y border-white/15 bg-white/15 sm:grid-cols-4">
            <div className="bg-black/10 p-4"><span className="block text-[10px] uppercase tracking-wider text-white/60">Budget</span><strong className="mt-1 block text-sm">{budget}</strong></div>
            <div className="bg-black/10 p-4"><span className="block text-[10px] uppercase tracking-wider text-white/60">Radius</span><strong className="mt-1 block text-sm">{radius}</strong></div>
            <div className="bg-black/10 p-4"><span className="block text-[10px] uppercase tracking-wider text-white/60">Saved</span><strong className="mt-1 block text-sm">{savedHospitals.length} hospitals</strong></div>
            <div className="bg-black/10 p-4"><span className="block text-[10px] uppercase tracking-wider text-white/60">Card ID</span><strong className="mt-1 block text-sm">{cardToken}</strong></div>
          </div>
          <div className="flex items-center justify-between gap-4 p-6">
            <span className="text-xs text-white/70">Discovery preferences only</span>
            <button onClick={() => setShowQr(value => !value)} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary"><QrCode className="h-4 w-4" /> {showQr ? "Hide card token" : "Show card token"}</button>
          </div>
          {showQr && <div className="mx-6 mb-6 rounded-lg bg-white p-4 text-center text-xs font-mono text-on-surface">{cardToken}<span className="mt-1 block font-sans text-[10px] text-tertiary">Use this secure card ID with a consent-enabled MedScout flow.</span></div>}
        </article>

        <aside className="rounded-2xl border border-surface-container-high bg-white p-5 shadow-sm">
          <h2 className="font-headline text-lg font-bold text-on-surface">AI context</h2>
          <p className="mt-2 text-sm text-on-surface-variant">The assistant can use these preferences when ranking hospitals. You can change them any time from your account.</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-surface-container-high pb-3"><span className="text-tertiary">Preferred area</span><strong>{location}</strong></div>
            <div className="flex justify-between gap-4 border-b border-surface-container-high pb-3"><span className="text-tertiary">Treatment ceiling</span><strong>{budget}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-tertiary">Travel radius</span><strong>{radius}</strong></div>
          </div>
          <button onClick={onOpenChat} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white"><Sparkles className="h-4 w-4" /> Ask AI with this context</button>
        </aside>
      </div>

      <section className="rounded-2xl border border-secondary/20 bg-secondary-container/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-white"><Link2 className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Optional government connection</p>
              <h2 className="mt-1 font-headline text-lg font-bold text-on-surface">Link your ABHA account</h2>
              <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">ABHA is the official ABDM health identifier. Linking it can support consent-based record access, but MedScout does not issue ABHA, request Aadhaar, or store medical records in this discovery card.</p>
            </div>
          </div>
          <a href="https://abdm.gov.in/" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-secondary hover:underline">About ABHA <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-secondary/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant"><LockKeyhole className="h-4 w-4 text-secondary" /><span>{abhaStatus?.message || "Checking ABDM connection readiness…"}</span></div>
          <button disabled={!abhaStatus?.configured} title="Requires approved ABDM integration configuration" className="rounded-lg border border-secondary/30 bg-white px-4 py-2 text-xs font-semibold text-secondary disabled:cursor-not-allowed disabled:opacity-50">{abhaStatus?.configured ? "Start consent flow" : "ABHA connection not configured"}</button>
        </div>
      </section>
    </section>
  );
}