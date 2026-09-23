/**
 * AuthModal.jsx
 * Premium glassmorphism Sign In / Create Account modal.
 * Supports: email+password login, registration, password strength indicator,
 *           forgot password flow, and role info display.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Eye,
  EyeOff,
  Activity,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

// Password strength calculator
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-teal-400" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

const DEMO_ACCOUNTS = [
  { email: "patient@demo.com", role: "Patient / User", color: "text-blue-600" },
  { email: "hospital@demo.com", role: "Hospital Admin", color: "text-amber-600" },
  { email: "verifier@demo.com", role: "Data Verifier", color: "text-teal-600" },
  { email: "admin@demo.com", role: "Platform Admin", color: "text-purple-600" }
];

export default function AuthModal({ isOpen, onClose, defaultTab = "signin", onSuccess }) {
  const { login, register, loading, error, clearError } = useAuth();
  const [tab, setTab] = useState(defaultTab); // "signin" | "register" | "forgot"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDemoHint, setShowDemoHint] = useState(true);

  // Form states
  const [signInForm, setSignInForm] = useState({ email: "", password: "", remember: false });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    preferredCity: "",
    agreedToTerms: false
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const modalRef = useRef(null);

  const passwordStrength = getPasswordStrength(registerForm.password);

  useEffect(() => {
    setTab(defaultTab);
    setLocalError("");
    setSuccessMsg("");
    clearError?.();
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayError = localError || error;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!signInForm.email || !signInForm.password) {
      setLocalError("Please enter your email and password.");
      return;
    }
    const result = await login(signInForm.email, signInForm.password, signInForm.remember);
    if (result.success) {
      setSuccessMsg(`Welcome back, ${result.user.name}!`);
      setTimeout(() => {
        onClose();
        onSuccess?.(result.user);
      }, 800);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setLocalError("Name, email and password are required.");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (registerForm.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (!registerForm.agreedToTerms) {
      setLocalError("Please agree to the Terms & Privacy Policy.");
      return;
    }
    const result = await register(registerForm);
    if (result.success) {
      setSuccessMsg(`Account created! Welcome, ${result.user.name}!`);
      setTimeout(() => {
        onClose();
        onSuccess?.(result.user);
      }, 800);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!forgotEmail) {
      setLocalError("Please enter your email address.");
      return;
    }
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("If an account exists, a reset link has been sent. Check your email.");
      }
    } catch {
      setLocalError("Network error. Please try again.");
    }
  };

  const fillDemo = (email) => {
    if (tab === "signin") {
      setSignInForm(prev => ({ ...prev, email, password: "Demo@1234" }));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center overflow-y-auto p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur-2xl animate-[fadeInScale_0.2s_ease-out] sm:max-h-[calc(100vh-3rem)]"
        style={{ animation: "fadeInScale 0.2s ease-out" }}
      >
        {/* Header gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-5">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-md">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm leading-none">MedScout</p>
              <p className="text-[10px] text-secondary uppercase font-bold tracking-widest leading-none mt-0.5">
                Clinical Evidence
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          {tab !== "forgot" && (
            <div className="flex rounded-xl bg-surface-container-low p-1 mb-5">
              {[
                { id: "signin", label: "Sign In" },
                { id: "register", label: "Create Account" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setLocalError(""); setSuccessMsg(""); clearError?.(); }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-white text-primary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error message */}
          {displayError && !successMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* ── SIGN IN FORM ─────────────────────────────────────────────── */}
          {tab === "signin" && !successMsg && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <h2 className="text-xl font-bold text-on-surface mb-1">Welcome back</h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Sign in to save hospitals, comparisons and preferences.
              </p>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="signin-email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    value={signInForm.email}
                    onChange={e => setSignInForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant" htmlFor="signin-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab("forgot")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={signInForm.password}
                    onChange={e => setSignInForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={signInForm.remember}
                  onChange={e => setSignInForm(p => ({ ...p, remember: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary"
                />
                Remember me
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Signing in…" : "Sign In"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Google (UI only) */}
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-container-high" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-[11px] text-on-surface-variant">OR</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-xs text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-primary font-semibold hover:underline">
                  Create Account
                </button>
              </p>

              {/* Demo accounts hint */}
              {showDemoHint && (
                <div className="mt-2 p-3 rounded-xl bg-secondary-container/40 border border-secondary/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Demo Accounts — password: Demo@1234
                    </p>
                    <button onClick={() => setShowDemoHint(false)} className="text-on-surface-variant hover:text-on-surface">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {DEMO_ACCOUNTS.map(acc => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemo(acc.email)}
                        className="text-left px-2 py-1 rounded-lg hover:bg-white/70 transition-colors"
                      >
                        <p className={`text-[10px] font-bold ${acc.color}`}>{acc.role}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{acc.email}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* ── REGISTER FORM ─────────────────────────────────────────────── */}
          {tab === "register" && !successMsg && (
            <form onSubmit={handleRegister} className="space-y-3">
              <h2 className="text-xl font-bold text-on-surface mb-1">Create your account</h2>
              <p className="text-xs text-on-surface-variant mb-3">
                Optional — you can explore hospitals without an account.
              </p>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="reg-name">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    value={registerForm.name}
                    onChange={e => setRegisterForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="reg-email">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={registerForm.email}
                    onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="reg-password">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={registerForm.password}
                    onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-0.5 flex-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`h-1 rounded-full flex-1 transition-colors ${
                            i <= passwordStrength.score ? passwordStrength.color : "bg-surface-container-high"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium">{passwordStrength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="reg-confirm">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={registerForm.confirmPassword}
                    onChange={e => setRegisterForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                      registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
                        ? "border-red-300"
                        : "border-surface-container-high"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="reg-phone">
                    Phone <span className="font-normal opacity-60">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                    <input
                      id="reg-phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={e => setRegisterForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 XXXXX"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="reg-city">
                    City <span className="font-normal opacity-60">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                    <input
                      id="reg-city"
                      type="text"
                      value={registerForm.preferredCity}
                      onChange={e => setRegisterForm(p => ({ ...p, preferredCity: e.target.value }))}
                      placeholder="New Delhi"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="reg-terms"
                  checked={registerForm.agreedToTerms}
                  onChange={e => setRegisterForm(p => ({ ...p, agreedToTerms: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-primary rounded"
                />
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  I agree to the{" "}
                  <span className="text-primary font-medium cursor-pointer hover:underline">Terms of Service</span>{" "}
                  &{" "}
                  <span className="text-primary font-medium cursor-pointer hover:underline">Privacy Policy</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Creating account…" : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="font-bold text-primary">G</span>
                Continue with Google
              </button>

              <p className="text-center text-xs text-on-surface-variant">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("signin")} className="text-primary font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ──────────────────────────────────────── */}
          {tab === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
              >
                ← Back to Sign In
              </button>
              <h2 className="text-xl font-bold text-on-surface">Forgot Password?</h2>
              <p className="text-xs text-on-surface-variant">
                Enter your email and we'll send you a reset link.
              </p>

              {successMsg ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-white text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-md disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Send Reset Link
                  </button>
                </>
              )}
            </form>
          )}

          {/* Footer note */}
          <p className="text-[10px] text-on-surface-variant/60 text-center mt-4 leading-relaxed">
            Basic hospital discovery, comparison &amp; AI search work without an account.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
