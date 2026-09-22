/**
 * AuthContext.jsx
 * Global authentication context for MedScout.
 * Provides: user, token, login, logout, register, isAuthenticated, hasRole
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext(null);

const API_BASE = "/api";
const ACCESS_TOKEN_KEY = "medscout_access_token";
const REFRESH_TOKEN_KEY = "medscout_refresh_token";
const USER_KEY = "medscout_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);

  // ── Persist state to localStorage ─────────────────────────────────────────
  const persist = useCallback((userData, access, refresh) => {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    if (access) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, []);

  // ── Silent token refresh ──────────────────────────────────────────────────
  const silentRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setAccessToken(data.data.accessToken);
        persist(data.data.user, data.data.accessToken, data.data.refreshToken);
        // Schedule next refresh (access token lasts 15 min — refresh at 13 min)
        scheduleRefresh();
      } else {
        // Refresh failed — log out silently
        clearAuth();
      }
    } catch {
      // Network error — keep user logged in optimistically, retry later
    }
  }, [persist]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // Access token expires in 15 min → refresh after 13 min
    refreshTimerRef.current = setTimeout(silentRefresh, 13 * 60 * 1000);
  }, [silentRefresh]);

  // ── Clear auth state ──────────────────────────────────────────────────────
  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    persist(null, null, null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, [persist]);

  // ── On mount: check stored tokens ─────────────────────────────────────────
  useEffect(() => {
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedAccess && storedRefresh) {
      // Attempt silent refresh immediately to validate session
      silentRefresh();
    }
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed.");
        return { success: false, error: data.error };
      }
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      persist(data.data.user, data.data.accessToken, data.data.refreshToken);
      scheduleRefresh();
      return { success: true, user: data.data.user };
    } catch (err) {
      const msg = "Network error. Please check your connection.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [persist, scheduleRefresh]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Registration failed.");
        return { success: false, error: data.error };
      }
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      persist(data.data.user, data.data.accessToken, data.data.refreshToken);
      scheduleRefresh();
      return { success: true, user: data.data.user };
    } catch (err) {
      const msg = "Network error. Please check your connection.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [persist, scheduleRefresh]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
    } catch {
      // Silent — logout locally regardless
    }
    clearAuth();
  }, [clearAuth]);

  // ── Auth fetch helper (attaches Bearer token) ─────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
  }, []);

  // ── Role helpers ──────────────────────────────────────────────────────────
  const isAuthenticated = !!user;
  const hasRole = useCallback((...roles) => user && roles.includes(user.role), [user]);
  const isAdmin = useCallback(() => hasRole("platform_admin"), [hasRole]);
  const isVerifier = useCallback(() => hasRole("verifier", "platform_admin"), [hasRole]);
  const isHospitalAdmin = useCallback(
    () => hasRole("hospital_admin", "verifier", "platform_admin"),
    [hasRole]
  );

  const value = {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    hasRole,
    isAdmin,
    isVerifier,
    isHospitalAdmin,
    login,
    logout,
    register,
    authFetch,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;
