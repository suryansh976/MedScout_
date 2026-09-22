import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import apiRouter from "./routes/api.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Strict limit on auth endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, error: "Too many authentication attempts. Please try again in 15 minutes.", code: "RATE_LIMITED" },
  standardHeaders: true,
  legacyHeaders: false
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: { success: false, error: "Too many requests. Please slow down.", code: "RATE_LIMITED" },
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}${req.user ? ` [${req.user.role}:${req.user.id}]` : ""}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api", apiRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    platform: "MedScout Clinical Evidence Engine",
    version: "2.0.0-auth",
    timestamp: new Date(),
    features: ["JWT Auth", "RBAC", "Rate Limiting", "5-Role System"]
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found.` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({ success: false, error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  MedScout Clinical Evidence REST API v2.0 — Auth      `);
  console.log(`  Port: http://localhost:${PORT}                       `);
  console.log(`  Registry Node: ABDM HFR v4.2 / MoHFW CEA Synced      `);
  console.log(`  Auth: JWT (15m access) + Refresh (7d)                `);
  console.log(`  Roles: guest | user | hospital_admin | verifier |     `);
  console.log(`         platform_admin                                 `);
  console.log(`=======================================================`);
  console.log(`\n  Demo Accounts:`);
  console.log(`  patient@demo.com   / Demo@1234  → user`);
  console.log(`  hospital@demo.com  / Demo@1234  → hospital_admin`);
  console.log(`  verifier@demo.com  / Demo@1234  → verifier`);
  console.log(`  admin@demo.com     / Demo@1234  → platform_admin\n`);
});
