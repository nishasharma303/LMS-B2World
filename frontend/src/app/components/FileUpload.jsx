"use client";

import { useRef, useState } from "react";
import { uploadPdf, uploadVideo, uploadThumbnail } from "@/app/services/uploadService";
import useAuthStore from "@/app/store/authStore";

// type: "pdf" | "video" | "thumbnail"
// onUploaded: (url, publicId) => void
// currentUrl: string (shows existing file)
export default function FileUpload({ type = "pdf", onUploaded, currentUrl = "", label }) {
  const { token } = useAuthStore();
  const inputRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl);

  const config = {
    pdf: {
      accept: ".pdf,application/pdf",
      label: label || "Upload PDF",
      icon: "📄",
      maxSize: "10MB",
      hint: "PDF files only, max 10MB",
    },
    video: {
      accept: "video/mp4,video/webm,video/ogg,video/quicktime",
      label: label || "Upload Video",
      icon: "🎬",
      maxSize: "500MB",
      hint: "MP4, WebM, MOV — max 500MB",
    },
    thumbnail: {
      accept: "image/jpeg,image/png,image/webp",
      label: label || "Upload Thumbnail",
      icon: "🖼️",
      maxSize: "5MB",
      hint: "JPG, PNG, WebP — max 5MB, 16:9 recommended",
    },
  }[type];

  const uploadFn = { pdf: uploadPdf, video: uploadVideo, thumbnail: uploadThumbnail }[type];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setProgress(0);
    setUploading(true);

    try {
      const res = await uploadFn(file, token, (pct) => setProgress(pct));
      const url = res.data.url;
      const publicId = res.data.publicId;
      setUploadedUrl(url);
      onUploaded?.(url, publicId);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input so same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {/* Drop zone / click area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer
          ${uploading ? "border-blue-300 bg-blue-50 cursor-not-allowed" : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          onChange={handleFileChange}
          className="sr-only"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-blue-600">Uploading... {progress}%</p>
            <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-blue-400">Please wait, do not close this page</p>
          </div>
        ) : uploadedUrl ? (
          <div className="space-y-2">
            <span className="text-2xl">{config.icon}</span>
            <p className="text-sm font-semibold text-emerald-600">✅ File uploaded</p>
            <p className="text-xs text-neutral-400 truncate max-w-xs mx-auto">{uploadedUrl}</p>
            <p className="text-xs text-neutral-400 underline">Click to replace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-3xl">{config.icon}</span>
            <p className="text-sm font-semibold text-neutral-700">{config.label}</p>
            <p className="text-xs text-neutral-400">{config.hint}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500 font-medium">⚠️ {error}</p>
      )}

      {/* Preview */}
      {uploadedUrl && !uploading && (
        <div className="mt-3">
          {type === "thumbnail" && (
            <img
              src={uploadedUrl}
              alt="Thumbnail preview"
              className="w-full max-w-xs rounded-xl object-cover aspect-video border border-neutral-200"
            />
          )}
          {type === "pdf" && (
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              📄 View uploaded PDF
            </a>
          )}
          {type === "video" && (
            <video
              src={uploadedUrl}
              controls
              className="w-full max-w-sm rounded-xl border border-neutral-200"
            />
          )}
        </div>
      )}
    </div>
  );
}