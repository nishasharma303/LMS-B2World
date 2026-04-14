const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Generic XHR upload with progress ─────────────────────────────────────────
async function uploadFile(endpoint, file, token, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || "Upload failed"));
        }
      } catch {
        reject(new Error("Invalid server response"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", `${API_BASE}/upload/${endpoint}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

// ── Upload PDF ────────────────────────────────────────────────────────────────
// public_id is stored as "pdf_<timestamp>.pdf" in Cloudinary (set in uploadMiddleware),
// so req.file.path already returns the correct .pdf URL — no manipulation needed.
export async function uploadPdf(file, token, onProgress) {
  return uploadFile("pdf", file, token, onProgress);
}

// ── Build a force-download URL for a Cloudinary raw PDF ──────────────────────
// Transformations for raw resources go in the URL path, NOT as query params.
// /raw/upload/v.../file.pdf  →  /raw/upload/fl_attachment/v.../file.pdf
export function getPdfDownloadUrl(url) {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("fl_attachment")) return url; // already patched
  return url.replace("/raw/upload/", "/raw/upload/fl_attachment/");
}

// ── Upload Video ──────────────────────────────────────────────────────────────
export async function uploadVideo(file, token, onProgress) {
  return uploadFile("video", file, token, onProgress);
}

// ── Upload Thumbnail ──────────────────────────────────────────────────────────
export async function uploadThumbnail(file, token, onProgress) {
  return uploadFile("thumbnail", file, token, onProgress);
}

// ── Delete file from Cloudinary ───────────────────────────────────────────────
export async function deleteUpload(publicId, token, resourceType = "raw") {
  const res = await fetch(
    `${API_BASE}/upload/${encodeURIComponent(publicId)}?resourceType=${resourceType}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Delete failed");
  return data;
}