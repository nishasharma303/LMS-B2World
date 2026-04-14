"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/authStore";
import { getMyCertificates } from "@/app/services/certificateService";

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(17, 24, 39, ${alpha})`;

  let sanitized = hex.replace("#", "").trim();

  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (sanitized.length !== 6) return `rgba(17, 24, 39, ${alpha})`;

  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
};

export default function StudentCertificatesPage() {
  const router = useRouter();
  const { token, user, institute } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "STUDENT") {
      router.push("/dashboard");
      return;
    }

    const loadCertificates = async () => {
      try {
        setLoading(true);
        setPageError("");
        const res = await getMyCertificates(token);
        setCertificates(res.data || []);
      } catch (error) {
        setPageError(error?.message || "Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [mounted, token, user, router]);

  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#334155";

  const accentSoft = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.18),
      backgroundColor: hexToRgba(primaryColor, 0.08),
      color: primaryColor,
    }),
    [primaryColor]
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Student Certificates
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
              My Certificates
            </h1>
          </div>

          <Link
            href="/student"
            className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            Back
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            Loading certificates...
          </div>
        ) : pageError ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-red-600 shadow-sm">
            {pageError}
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
            No certificates generated yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <Link
                key={certificate.id}
                href={`/student/certificates/${certificate.id}`}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-slate-900">
                      {certificate.course?.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {certificate.course?.category || "General"}
                    </p>
                  </div>

                  <div
                    className="rounded-full border px-3 py-1 text-xs font-semibold"
                    style={accentSoft}
                  >
                    Issued
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <InfoRow label="Certificate No." value={certificate.certificateNo} />
                  <InfoRow label="Issued On" value={formatDate(certificate.issuedAt)} />
                  <InfoRow label="Instructor" value={certificate.course?.teacher?.name || "Assigned Teacher"} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[55%] break-words text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}