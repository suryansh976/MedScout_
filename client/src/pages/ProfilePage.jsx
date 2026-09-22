import React, { useEffect, useState } from "react";
import { Bookmark, MessageSquare, Save, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import RoleBadge from "../components/auth/RoleBadge.jsx";

export default function ProfilePage() {
  const { user, authFetch } = useAuth();
  const [profile, setProfile] = useState(user);
  const [savedHospitals, setSavedHospitals] = useState([]);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const responses = await Promise.all([
      authFetch("/api/user/profile"),
      authFetch("/api/user/saved-hospitals"),
      authFetch("/api/user/saved-comparisons"),
      authFetch("/api/user/preferences")
    ]);
    const data = await Promise.all(responses.map(response => response.json()));
    if (data[0].success) setProfile(data[0].data);
    if (data[1].success) setSavedHospitals(data[1].data);
    if (data[2].success) setSavedComparisons(data[2].data);
    if (data[3].success) setPreferences(data[3].data);
  };

  useEffect(() => { loadData().catch(() => setMessage("Unable to load profile data.")); }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    const response = await authFetch("/api/user/profile", { method: "PUT", body: JSON.stringify(profile) });
    const data = await response.json();
    if (data.success) { setProfile(data.data); setMessage("Profile updated."); }
  };

  const removeHospital = async (hospitalId) => {
    const response = await authFetch(`/api/user/saved-hospitals/${hospitalId}`, { method: "DELETE" });
    if (response.ok) setSavedHospitals(items => items.filter(item => item.hospitalId !== hospitalId));
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    const response = await authFetch("/api/user/preferences", { method: "PUT", body: JSON.stringify(preferences) });
    const data = await response.json();
    if (data.success) { setPreferences(data.data); setMessage("Preferences updated."); }
  };

  return (
    <section className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-surface-container-high pb-5">
        <div><p className="text-xs font-bold uppercase tracking-widest text-secondary">Account</p><h1 className="font-headline text-3xl font-bold text-on-surface">Your MedScout profile</h1></div>
        <RoleBadge role={profile?.role} />
      </header>
      {message && <p className="rounded-lg bg-secondary-container px-3 py-2 text-sm text-secondary">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={updateProfile} className="space-y-4 rounded-2xl border border-surface-container-high bg-white p-5 shadow-sm">
          <h2 className="font-headline text-lg font-bold">Profile information</h2>
          <label className="block text-sm font-semibold">Name<input value={profile?.name || ""} onChange={event => setProfile({ ...profile, name: event.target.value })} className="mt-1 w-full rounded-lg border border-surface-container-high p-2.5 font-normal" /></label>
          <label className="block text-sm font-semibold">Phone<input value={profile?.phone || ""} onChange={event => setProfile({ ...profile, phone: event.target.value })} className="mt-1 w-full rounded-lg border border-surface-container-high p-2.5 font-normal" /></label>
          <label className="block text-sm font-semibold">Preferred city<input value={profile?.preferredCity || ""} onChange={event => setProfile({ ...profile, preferredCity: event.target.value })} className="mt-1 w-full rounded-lg border border-surface-container-high p-2.5 font-normal" /></label>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"><Save className="h-4 w-4" /> Save profile</button>
        </form>
        <form onSubmit={savePreferences} className="space-y-4 rounded-2xl border border-surface-container-high bg-white p-5 shadow-sm">
          <h2 className="font-headline text-lg font-bold">Preferences</h2>
          <label className="block text-sm font-semibold">Location<input value={preferences.location?.value || ""} onChange={event => setPreferences({ ...preferences, location: event.target.value })} className="mt-1 w-full rounded-lg border border-surface-container-high p-2.5 font-normal" /></label>
          <label className="block text-sm font-semibold">Maximum distance (km)<input type="number" value={preferences.maxDistance?.value || ""} onChange={event => setPreferences({ ...preferences, maxDistance: event.target.value })} className="mt-1 w-full rounded-lg border border-surface-container-high p-2.5 font-normal" /></label>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"><Save className="h-4 w-4" /> Save preferences</button>
        </form>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-container-high bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold"><Bookmark className="h-5 w-5 text-primary" /> Saved hospitals</h2>{savedHospitals.length ? savedHospitals.map(item => <div key={item.id} className="flex items-center justify-between border-t border-surface-container-high py-3 text-sm"><span>{item.hospitalId}<small className="block text-tertiary">{item.notes || "No notes"}</small></span><button onClick={() => removeHospital(item.hospitalId)} className="text-danger" title="Remove saved hospital"><Trash2 className="h-4 w-4" /></button></div>) : <p className="text-sm text-tertiary">No saved hospitals yet.</p>}</div>
        <div className="rounded-2xl border border-surface-container-high bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold"><MessageSquare className="h-5 w-5 text-secondary" /> Saved comparisons</h2>{savedComparisons.length ? savedComparisons.map(item => <div key={item.id} className="border-t border-surface-container-high py-3 text-sm">{item.hospitalIds.join(", ")}</div>) : <p className="text-sm text-tertiary">No saved comparisons yet.</p>}</div>
      </div>
    </section>
  );
}
