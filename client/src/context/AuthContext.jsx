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

function getAuthStorage() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) ? sessionStorage : localStorage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = getAuthStorage().getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => getAuthStorage().getItem(ACCESS_TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);
  const refreshAttemptedRef = useRef(false);
  const silentRefreshRef = useRef(null);

  // ── Persist state to localStorage ─────────────────────────────────────────
  const persist = useCallback((userData, access, refresh, storage = localStorage) => {
    const otherStorage = storage === localStorage ? sessionStorage : localStorage;
    otherStorage.removeItem(USER_KEY);
    otherStorage.removeItem(ACCESS_TOKEN_KEY);
    otherStorage.removeItem(REFRESH_TOKEN_KEY);
    if (userData) {
      storage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      storage.removeItem(USER_KEY);
    }
    if (access) {
      storage.setItem(ACCESS_TOKEN_KEY, access);
    } else {
      storage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (refresh) {
      storage.setItem(REFRESH_TOKEN_KEY, refresh);
    } else {
      storage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, []);

  // ── Clear auth state ──────────────────────────────────────────────────────
  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    persist(null, null, null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, [persist]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // Access token expires in 15 min; refresh after 13 min.
    refreshTimerRef.current = setTimeout(() => silentRefreshRef.current?.(), 13 * 60 * 1000);
  }, []);

  // ── Silent token refresh ──────────────────────────────────────────────────
  const silentRefresh = useCallback(async () => {
    const storage = getAuthStorage();
    const refreshToken = storage.getItem(REFRESH_TOKEN_KEY);
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
        persist(data.data.user, data.data.accessToken, data.data.refreshToken, storage);
        scheduleRefresh();
      } else {
        clearAuth();
      }
    } catch {
      // Keep the current session during transient network failures.
    }
  }, [clearAuth, persist, scheduleRefresh]);

  useEffect(() => {
    silentRefreshRef.current = silentRefresh;
  }, [silentRefresh]);

  // ── On mount: check stored tokens ─────────────────────────────────────────
  useEffect(() => {
    if (refreshAttemptedRef.current) return undefined;
    refreshAttemptedRef.current = true;
    const storage = getAuthStorage();
    const storedAccess = storage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = storage.getItem(REFRESH_TOKEN_KEY);
    if (storedAccess && storedRefresh) {
      // Attempt silent refresh immediately to validate session
      silentRefresh();
    }
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [silentRefresh]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, remember = true) => {
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
      persist(data.data.user, data.data.accessToken, data.data.refreshToken, remember ? localStorage : sessionStorage);
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
    const storage = getAuthStorage();
    const refreshToken = storage.getItem(REFRESH_TOKEN_KEY);
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
    const token = getAuthStorage().getItem(ACCESS_TOKEN_KEY);
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
