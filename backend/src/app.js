import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import instituteRoutes from "./routes/instituteRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import userManagementRoutes from "./routes/userManagementRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import { env } from "./config/env.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ── Fix __dirname in ES modules ───────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Trust proxy (IMPORTANT for cookies on Render) ─────────────────────────────
app.set("trust proxy", 1);

// ── CORS Configuration (Production Safe) ──────────────────────────────────────
const allowedOrigins = [
  env.frontendUrl, // your Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps / postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ── Static uploads (fallback only, NOT for production use) ────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Health Check Route ────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/institute-users", userManagementRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;