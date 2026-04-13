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
import { env } from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── CORS — must be before everything ─────────────────────────────────────────
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

// ── Body parsers — increase limit for base64 or large JSON payloads ───────────
// NOTE: multer handles multipart/form-data (file uploads) separately.
// These limits only apply to JSON and URL-encoded bodies.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ── Static uploads (local fallback, not used in production with Cloudinary) ───
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/institute-users", userManagementRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);

export default app;