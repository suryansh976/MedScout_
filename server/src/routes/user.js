/**
 * user.js — Authenticated user routes
 *
 * GET  /api/user/profile             — get own profile
 * PUT  /api/user/profile             — update name, phone, preferred city
 * GET  /api/user/preferences         — get preference profile
 * PUT  /api/user/preferences         — update explicit preferences
 * GET  /api/user/saved-hospitals     — list bookmarked hospitals
 * POST /api/user/saved-hospitals     — save a hospital
 * DELETE /api/user/saved-hospitals/:hospitalId — remove saved hospital
 * GET  /api/user/saved-comparisons   — list saved comparisons
 * POST /api/user/saved-comparisons   — save a comparison
 * DELETE /api/user/saved-comparisons/:id — remove saved comparison
 */

import express from "express";
import {
  findUserById,
  updateUser,
  safeProfile,
  addSavedHospital,
  removeSavedHospital,
  addSavedComparison,
  removeSavedComparison
} from "../data/usersStore.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get("/profile", (req, res) => {
  res.json({ success: true, data: req.user });
});

// ─── PUT /api/user/profile ────────────────────────────────────────────────────
router.put("/profile", (req, res) => {
  const { name, phone, preferredCity, preferredLanguage } = req.body;
  const updates = {};

  if (name && name.trim()) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone || null;
  if (preferredCity !== undefined) updates.preferredCity = preferredCity || null;
  if (preferredLanguage !== undefined) updates.preferredLanguage = preferredLanguage || "en";

  const updated = updateUser(req.user.id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: "User not found." });
  }

  res.json({ success: true, data: safeProfile(updated) });
});

// ─── GET /api/user/preferences ────────────────────────────────────────────────
router.get("/preferences", (req, res) => {
  const user = findUserById(req.user.id);
  res.json({ success: true, data: user.preferences || {} });
});

// ─── PUT /api/user/preferences ────────────────────────────────────────────────
router.put("/preferences", (req, res) => {
  const { location, budget, maxDistance, priorities } = req.body;
  const user = findUserById(req.user.id);
  const currentPrefs = user.preferences || {};

  const updatedPrefs = { ...currentPrefs };

  if (location !== undefined) {
    updatedPrefs.location = { value: location, source: "user_explicit" };
  }
  if (budget !== undefined) {
    updatedPrefs.budget = { max: budget, currency: "INR", source: "user_explicit" };
  }
  if (maxDistance !== undefined) {
    updatedPrefs.maxDistance = { value: maxDistance, unit: "km", source: "user_explicit" };
  }
  if (priorities !== undefined) {
    updatedPrefs.priorities = priorities;
  }

  const updated = updateUser(req.user.id, { preferences: updatedPrefs });
  res.json({ success: true, data: updated.preferences });
});

// ─── GET /api/user/saved-hospitals ───────────────────────────────────────────
router.get("/saved-hospitals", (req, res) => {
  const user = findUserById(req.user.id);
  res.json({
    success: true,
    total: user.savedHospitals.length,
    data: user.savedHospitals
  });
});

// ─── POST /api/user/saved-hospitals ──────────────────────────────────────────
router.post("/saved-hospitals", (req, res) => {
  const { hospitalId, context, notes } = req.body;

  if (!hospitalId) {
    return res.status(400).json({ success: false, error: "hospitalId is required." });
  }

  const entry = addSavedHospital(req.user.id, { hospitalId, context, notes });
  if (!entry) {
    return res.status(404).json({ success: false, error: "User not found." });
  }

  res.status(201).json({ success: true, data: entry });
});

// ─── DELETE /api/user/saved-hospitals/:hospitalId ─────────────────────────────
router.delete("/saved-hospitals/:hospitalId", (req, res) => {
  const removed = removeSavedHospital(req.user.id, req.params.hospitalId);
  if (!removed) {
    return res.status(404).json({ success: false, error: "User not found." });
  }
  res.json({ success: true, message: "Hospital removed from saved list." });
});

// ─── GET /api/user/saved-comparisons ─────────────────────────────────────────
router.get("/saved-comparisons", (req, res) => {
  const user = findUserById(req.user.id);
  res.json({
    success: true,
    total: user.savedComparisons.length,
    data: user.savedComparisons
  });
});

// ─── POST /api/user/saved-comparisons ────────────────────────────────────────
router.post("/saved-comparisons", (req, res) => {
  const { diseaseId, treatmentId, hospitalIds, filters } = req.body;

  if (!hospitalIds || !hospitalIds.length) {
    return res.status(400).json({ success: false, error: "hospitalIds array is required." });
  }

  const entry = addSavedComparison(req.user.id, { diseaseId, treatmentId, hospitalIds, filters });
  if (!entry) {
    return res.status(404).json({ success: false, error: "User not found." });
  }

  res.status(201).json({ success: true, data: entry });
});

// ─── DELETE /api/user/saved-comparisons/:id ───────────────────────────────────
router.delete("/saved-comparisons/:id", (req, res) => {
  const removed = removeSavedComparison(req.user.id, req.params.id);
  if (!removed) {
    return res.status(404).json({ success: false, error: "User not found." });
  }
  res.json({ success: true, message: "Comparison removed from saved list." });
});

export default router;
