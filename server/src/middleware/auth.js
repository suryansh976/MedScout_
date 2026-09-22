/**
 * auth.js — JWT authentication middleware
 *
 * Provides:
 *   authenticateToken   — hard require valid JWT
 *   optionalAuth        — attach user if token present, continue either way
 *   requireRole         — RBAC role guard (use after authenticateToken)
 */

import jwt from "jsonwebtoken";
import { findUserById, safeProfile } from "../data/usersStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "medscout_dev_jwt_secret_change_in_production";
const JWT_EXPIRY = "15m"; // short-lived access token

/**
 * Sign a new access token.
 */
export function signAccessToken(userId, role) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode a token. Returns payload or null.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware: require a valid Bearer JWT.
 * Attaches req.user (safe profile) on success.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please sign in.",
      code: "AUTH_REQUIRED"
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: "Session expired or token invalid. Please sign in again.",
      code: "TOKEN_INVALID"
    });
  }

  const user = findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "User account not found.",
      code: "USER_NOT_FOUND"
    });
  }

  req.user = safeProfile(user);
  next();
}

/**
 * Middleware: attach user if token is valid, but do not block if absent.
 * req.user will be null for guests.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = findUserById(payload.sub);
      if (user) req.user = safeProfile(user);
    }
  }

  if (!req.user) req.user = null;
  next();
}

/**
 * Middleware factory: allow only specified roles.
 * Must be used AFTER authenticateToken.
 *
 * @param {...string} roles — allowed role strings
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
        code: "AUTH_REQUIRED"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(", ")}. Your role: ${req.user.role}`,
        code: "INSUFFICIENT_ROLE",
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
}

export { JWT_SECRET };
