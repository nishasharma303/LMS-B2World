import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddlewares.js";
import {
  uploadPdfFile,
  uploadVideoFile,
  uploadImageFile,
} from "../middlewares/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ── Error handler ─────────────────────────────────────────────────────────────
const handleUploadError = (err, res) => {
  console.error("Upload error:", err?.message || err);
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large." });
  }
  if (err?.http_code === 413 || err?.message?.includes("413")) {
    return res.status(400).json({
      success: false,
      message: "File too large for your Cloudinary plan. Use a YouTube URL for large videos.",
    });
  }
  if (err?.message?.includes("aborted")) {
    return res.status(400).json({ success: false, message: "Upload interrupted. Please try again." });
  }
  return res.status(400).json({ success: false, message: err?.message || "Upload failed" });
};

// ── POST /api/upload/pdf ──────────────────────────────────────────────────────
// public_id is set to "pdf_<timestamp>.pdf" in uploadMiddleware, so
// req.file.path already contains the correct URL ending in .pdf.
// No URL manipulation needed here.
router.post("/pdf", protect, allowRoles("TEACHER", "INSTITUTE_ADMIN"), (req, res) => {
  uploadPdfFile.single("file")(req, res, (err) => {
    if (err) return handleUploadError(err, res);
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    return res.status(200).json({
      success: true,
      message: "PDF uploaded successfully",
      data: {
        url: req.file.path,           // already correct: .../pdf_xxx.pdf
        publicId: req.file.filename,  // lms/<inst>/pdfs/pdf_xxx.pdf
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  });
});

// ── POST /api/upload/video ────────────────────────────────────────────────────
router.post("/video", protect, allowRoles("TEACHER", "INSTITUTE_ADMIN"), (req, res) => {
  uploadVideoFile.single("file")(req, res, (err) => {
    if (err) return handleUploadError(err, res);
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  });
});

// ── POST /api/upload/thumbnail ────────────────────────────────────────────────
router.post("/thumbnail", protect, allowRoles("TEACHER", "INSTITUTE_ADMIN"), (req, res) => {
  uploadImageFile.single("file")(req, res, (err) => {
    if (err) return handleUploadError(err, res);
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    return res.status(200).json({
      success: true,
      message: "Thumbnail uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
      },
    });
  });
});

// ── DELETE /api/upload/:publicId ──────────────────────────────────────────────
// PDFs are resource_type "raw"; videos are "video"; thumbnails are "image"
router.delete("/:publicId", protect, allowRoles("TEACHER", "INSTITUTE_ADMIN"), async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    const { resourceType = "raw" } = req.query;
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(400).json({ success: false, message: "Failed to delete file" });
    }
    return res.json({ success: true, message: "File deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;