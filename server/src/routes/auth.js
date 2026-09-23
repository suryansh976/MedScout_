/**
 * auth.js — Authentication routes
 *
 * POST /api/auth/register     — create new user account
 * POST /api/auth/login        — email + password → access + refresh tokens
 * POST /api/auth/logout       — invalidate refresh token
 * POST /api/auth/refresh      — get new access token from refresh token
 * POST /api/auth/forgot-password — send reset token (dev: returns token directly)
 * POST /api/auth/reset-password  — consume reset token, update password
 * GET  /api/auth/me           — return current user's safe profile
 */

import express from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  safeProfile,
  storeRefreshToken,
  consumeRefreshToken,
  deleteRefreshToken
} from "../data/usersStore.js";
import {
  signAccessToken,
  verifyToken,
  authenticateToken,
  JWT_SECRET
} from "../middleware/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "medscout_dev_refresh_secret_change_in_production";
const REFRESH_EXPIRY = "7d";

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
    jwtid: randomBytes(16).toString("hex")
  });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, preferredCity, preferredLanguage } =
      req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email and password are required.",
        code: "VALIDATION_ERROR"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match.",
        code: "PASSWORD_MISMATCH"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters.",
        code: "WEAK_PASSWORD"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address.",
        code: "INVALID_EMAIL"
      });
    }

    if (findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
        code: "EMAIL_TAKEN"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      phone: phone || null,
      preferredCity: preferredCity || null,
      preferredLanguage: preferredLanguage || "en"
    });

    // Issue tokens immediately (email verification simulated)
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    storeRefreshToken(refreshToken, user.id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: safeProfile(user),
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    res.status(500).json({ success: false, error: "Registration failed. Please try again." });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
        code: "VALIDATION_ERROR"
      });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS"
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS"
      });
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    storeRefreshToken(refreshToken, user.id);

    res.json({
      success: true,
      message: "Signed in successfully.",
      data: {
        user: safeProfile(user),
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ success: false, error: "Login failed. Please try again." });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    deleteRefreshToken(refreshToken);
  }
  res.json({ success: true, message: "Signed out successfully." });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, error: "Refresh token required.", code: "NO_REFRESH_TOKEN" });
  }

  // Verify refresh token signature
  let payload;
  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, error: "Refresh token invalid or expired.", code: "REFRESH_INVALID" });
  }

  // Check it is in our store (not revoked)
  const userId = consumeRefreshToken(refreshToken);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Refresh token revoked or expired.", code: "REFRESH_REVOKED" });
  }

  const user = findUserById(userId);
  if (!user) {
    return res.status(401).json({ success: false, error: "User not found.", code: "USER_NOT_FOUND" });
  }

  // Issue fresh tokens
  const newAccessToken = signAccessToken(user.id, user.role);
  const newRefreshToken = signRefreshToken(user.id);
  storeRefreshToken(newRefreshToken, user.id);

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: safeProfile(user)
    }
  });
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required.", code: "VALIDATION_ERROR" });
  }

  const user = findUserByEmail(email);
  if (!user) {
    // Respond success regardless to prevent email enumeration
    return res.json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent."
    });
  }

  const resetToken = randomBytes(32).toString("hex");
  const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  updateUser(user.id, { passwordResetToken: resetToken, passwordResetExpiry: resetExpiry });

  // In production: send email. In dev: return token directly.
  const isDev = process.env.NODE_ENV !== "production";
  res.json({
    success: true,
    message: "Password reset link generated.",
    ...(isDev && {
      _devOnly_resetToken: resetToken,
      _devOnly_note: "In production this is emailed, never returned in API response."
    })
  });
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ success: false, error: "Reset token and new password are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: "Passwords do not match.", code: "PASSWORD_MISMATCH" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters.", code: "WEAK_PASSWORD" });
  }

  // Find user with this reset token
  const { users } = await import("../data/usersStore.js");
  const user = users.find(u => u.passwordResetToken === resetToken && u.passwordResetExpiry > Date.now());

  if (!user) {
    return res.status(400).json({ success: false, error: "Reset token is invalid or has expired.", code: "RESET_TOKEN_INVALID" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  updateUser(user.id, { passwordHash, passwordResetToken: null, passwordResetExpiry: null });

  res.json({ success: true, message: "Password updated successfully. Please sign in." });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authenticateToken, (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
