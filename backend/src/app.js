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

const app = express();

 const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/institute-users", userManagementRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/payments", paymentRoutes);




export default app;