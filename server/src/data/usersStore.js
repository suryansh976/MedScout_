/**
 * usersStore.js
 * In-memory user store for MedScout MVP.
 * Replace with MongoDB/Mongoose in production.
 *
 * Roles: guest (unauthenticated), user, hospital_admin, verifier, platform_admin
 */

import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Seed password hash — Demo@1234
const DEMO_HASH = bcrypt.hashSync("Demo@1234", 10);

let users = [
  {
    id: "usr_patient_01",
    name: "Priya Sharma",
    email: "patient@demo.com",
    passwordHash: DEMO_HASH,
    role: "user",
    emailVerified: true,
    phone: "+91-9876543210",
    preferredCity: "New Delhi",
    preferredLanguage: "en",
    preferences: {
      location: { value: "New Delhi", source: "user_explicit" },
      budget: { max: 150000, currency: "INR", source: "user_explicit" },
      maxDistance: { value: 30, unit: "km", source: "user_explicit" },
      priorities: [
        { field: "diseaseSpecificOutcome", priority: 1 },
        { field: "treatmentVolume", priority: 2 },
        { field: "cost", priority: 3 },
        { field: "distance", priority: 4 }
      ]
    },
    savedHospitals: [
      {
        id: "save_h_001",
        hospitalId: "hosp_aiims_delhi",
        context: { diseaseId: "dis_cabg", treatmentId: "trt_cabg_onpump" },
        notes: "Compare with PGIMER — lower cost option",
        createdAt: "2026-09-01T10:00:00.000Z"
      }
    ],
    savedComparisons: [],
    chatSessions: [],
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "usr_hosp_admin_01",
    name: "Dr. Ramesh Gupta",
    email: "hospital@demo.com",
    passwordHash: DEMO_HASH,
    role: "hospital_admin",
    emailVerified: true,
    phone: "+91-9988776655",
    preferredCity: "Gurugram",
    preferredLanguage: "en",
    preferences: {},
    savedHospitals: [],
    savedComparisons: [],
    chatSessions: [],
    associatedHospitalId: "hosp_medanta_gurgaon",
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: "2026-07-15T09:00:00.000Z"
  },
  {
    id: "usr_verifier_01",
    name: "Dr. Ananya Roy",
    email: "verifier@demo.com",
    passwordHash: DEMO_HASH,
    role: "verifier",
    emailVerified: true,
    phone: "+91-9123456789",
    preferredCity: "New Delhi",
    preferredLanguage: "en",
    preferences: {},
    savedHospitals: [],
    savedComparisons: [],
    chatSessions: [],
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z"
  },
  {
    id: "usr_platform_admin_01",
    name: "Suresh Nair",
    email: "admin@demo.com",
    passwordHash: DEMO_HASH,
    role: "platform_admin",
    emailVerified: true,
    phone: "+91-9000000001",
    preferredCity: "Bengaluru",
    preferredLanguage: "en",
    preferences: {},
    savedHospitals: [],
    savedComparisons: [],
    chatSessions: [],
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }
];

/** Refresh tokens store: { token -> { userId, expiry } } */
const refreshTokens = new Map();

// ─── CRUD helpers ──────────────────────────────────────────────────────────────

export function findUserByEmail(email) {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserById(id) {
  return users.find(u => u.id === id) || null;
}

export function createUser({ name, email, passwordHash, phone, preferredCity, preferredLanguage }) {
  const newUser = {
    id: `usr_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "user",
    emailVerified: false,
    phone: phone || null,
    preferredCity: preferredCity || null,
    preferredLanguage: preferredLanguage || "en",
    preferences: {},
    savedHospitals: [],
    savedComparisons: [],
    chatSessions: [],
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  users.push(newUser);
  return newUser;
}

export function updateUser(id, updates) {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  return users[idx];
}

// ─── Safe public profile (no passwordHash) ────────────────────────────────────

export function safeProfile(user) {
  const { passwordHash, passwordResetToken, passwordResetExpiry, ...safe } = user;
  return safe;
}

// ─── Refresh token management ─────────────────────────────────────────────────

export function storeRefreshToken(token, userId) {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  refreshTokens.set(token, { userId, expiry });
}

export function consumeRefreshToken(token) {
  const entry = refreshTokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    refreshTokens.delete(token);
    return null;
  }
  return entry.userId;
}

export function deleteRefreshToken(token) {
  refreshTokens.delete(token);
}

// ─── Saved hospitals ──────────────────────────────────────────────────────────

export function addSavedHospital(userId, { hospitalId, context, notes }) {
  const user = findUserById(userId);
  if (!user) return null;
  const exists = user.savedHospitals.find(s => s.hospitalId === hospitalId);
  if (exists) return exists; // already saved
  const entry = {
    id: `save_h_${Date.now()}`,
    hospitalId,
    context: context || {},
    notes: notes || "",
    createdAt: new Date().toISOString()
  };
  user.savedHospitals.push(entry);
  updateUser(userId, { savedHospitals: user.savedHospitals });
  return entry;
}

export function removeSavedHospital(userId, hospitalId) {
  const user = findUserById(userId);
  if (!user) return false;
  const filtered = user.savedHospitals.filter(s => s.hospitalId !== hospitalId);
  updateUser(userId, { savedHospitals: filtered });
  return true;
}

// ─── Saved comparisons ────────────────────────────────────────────────────────

export function addSavedComparison(userId, { diseaseId, treatmentId, hospitalIds, filters }) {
  const user = findUserById(userId);
  if (!user) return null;
  const entry = {
    id: `cmp_${Date.now()}`,
    diseaseId: diseaseId || null,
    treatmentId: treatmentId || null,
    hospitalIds: hospitalIds || [],
    filters: filters || {},
    createdAt: new Date().toISOString()
  };
  user.savedComparisons.push(entry);
  updateUser(userId, { savedComparisons: user.savedComparisons });
  return entry;
}

export function removeSavedComparison(userId, comparisonId) {
  const user = findUserById(userId);
  if (!user) return false;
  const filtered = user.savedComparisons.filter(c => c.id !== comparisonId);
  updateUser(userId, { savedComparisons: filtered });
  return true;
}

export { users };
