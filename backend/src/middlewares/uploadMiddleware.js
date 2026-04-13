import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ── PDF — resource_type "raw", public_id includes .pdf extension ─────────────
// KEY BEHAVIOUR of multer-storage-cloudinary + resource_type "raw":
//   - Cloudinary stores the file under exactly the public_id you provide.
//   - public_id WITHOUT extension → stored as "pdf_1234"
//       → req.file.path = .../raw/upload/.../pdf_1234   (adding .pdf later = 404)
//   - public_id WITH ".pdf"       → stored as "pdf_1234.pdf"
//       → req.file.path = .../raw/upload/.../pdf_1234.pdf  ✅ works directly
// Fix: embed ".pdf" in the public_id so req.file.path is already the correct
// URL — no post-processing, no URL mangling needed anywhere.
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const instituteId = req.user?.instituteId || "unknown";
    return {
      folder: `lms/${instituteId}/pdfs`,
      resource_type: "raw",               // always public on Cloudinary free plan
      type: "upload",
      public_id: `pdf_${Date.now()}.pdf`, // ← extension baked in = correct URL
    };
  },
});

export const uploadPdfFile = multer({
  storage: pdfStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// ── Video — Cloudinary ────────────────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const instituteId = req.user?.instituteId || "unknown";
    return {
      folder: `lms/${instituteId}/videos`,
      resource_type: "video",
      type: "upload",
      allowed_formats: ["mp4", "webm", "ogg", "mov"],
      public_id: `video_${Date.now()}`,
    };
  },
});

export const uploadVideoFile = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only video files are allowed (mp4, webm, ogg, mov)"));
  },
});

// ── Image / Thumbnail — Cloudinary ───────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const instituteId = req.user?.instituteId || "unknown";
    return {
      folder: `lms/${instituteId}/thumbnails`,
      resource_type: "image",
      type: "upload",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `thumb_${Date.now()}`,
      transformation: [
        { width: 1280, height: 720, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    };
  },
});

export const uploadImageFile = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed (jpg, png, webp)"));
  },
});