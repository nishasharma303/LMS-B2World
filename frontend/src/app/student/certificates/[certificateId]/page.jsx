"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCertificateById } from "@/app/services/certificateService";
import useAuthStore from "@/app/store/authStore";

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

export default function StudentCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
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

    const loadCertificate = async () => {
      try {
        setLoading(true);
        setPageError("");
        const res = await getCertificateById(token, params.certificateId);
        setCertificate(res?.data || null);
      } catch (error) {
        setPageError(error?.message || "Failed to load certificate");
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    };

    if (params?.certificateId) {
      loadCertificate();
    }
  }, [mounted, token, user, params?.certificateId, router]);

  const primaryColor = certificate?.institute?.primaryColor || "#1e3a8a";
  const secondaryColor = certificate?.institute?.secondaryColor || "#7c3aed";

  const surfaceStyle = useMemo(
    () => ({
      background: `
        radial-gradient(circle at top left, ${hexToRgba(primaryColor, 0.14)}, transparent 26%),
        radial-gradient(circle at bottom right, ${hexToRgba(secondaryColor, 0.14)}, transparent 20%),
        linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)
      `,
    }),
    [primaryColor, secondaryColor]
  );

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
          Loading certificate...
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-red-200 bg-red-50 p-10 text-red-600 shadow-sm">
          {pageError}
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
          Certificate not found.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f1f5f9] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <button
              onClick={() => router.push("/student")}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Back
            </button>

            <button
              onClick={handlePrint}
              className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Download / Print Certificate
            </button>
          </div>

          <div className="certificate-print-wrapper">
            <div
              className="certificate-sheet overflow-hidden rounded-[32px] border-[8px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
              style={{
                borderColor: hexToRgba(primaryColor, 0.24),
                ...surfaceStyle,
              }}
            >
              <div
                className="h-3 w-full"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />

              <div className="certificate-inner px-6 py-6 sm:px-10 md:px-12 md:py-7">
                <div className="flex flex-col items-center text-center">
                  {certificate?.institute?.logoUrl ? (
                    <img
                      src={certificate.institute.logoUrl}
                      alt="Institute logo"
                      className="h-14 w-14 rounded-2xl object-cover shadow-sm sm:h-16 sm:w-16"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm sm:h-16 sm:w-16 sm:text-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      {certificate?.institute?.name?.charAt(0)?.toUpperCase() || "I"}
                    </div>
                  )}

                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400 sm:text-xs">
                    Certificate of Completion
                  </p>

                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    {certificate?.institute?.name || "Institute"}
                  </h1>

                  <div
                    className="mt-3 h-1.5 w-20 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    }}
                  />

                  <p className="mt-5 text-sm text-slate-600 sm:text-base">
                    This is to certify that
                  </p>

                  <h2
                    className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl"
                    style={{ color: primaryColor }}
                  >
                    {certificate?.student?.name || "Student"}
                  </h2>

                  <p className="mt-5 text-sm text-slate-600 sm:text-base">
                    has successfully completed the course
                  </p>

                  <h3 className="mt-2 max-w-4xl text-xl font-bold text-slate-900 sm:text-3xl">
                    {certificate?.course?.title || "Course"}
                  </h3>

                  <p className="mt-3 text-sm text-slate-500 sm:text-base">
                    Issued by {certificate?.institute?.name || "Institute"} on{" "}
                    {formatDate(certificate?.issuedAt)}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <InfoCard
                    label="Certificate No."
                    value={certificate?.certificateNo || "—"}
                  />
                  <InfoCard
                    label="Issued On"
                    value={formatDate(certificate?.issuedAt)}
                  />
                  <InfoCard
                    label="Course Category"
                    value={certificate?.course?.category || "General"}
                  />
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <SignatureBlock
                    title="Course Instructor"
                    name={certificate?.course?.teacher?.name || "Assigned Teacher"}
                  />
                  <SignatureBlock
                    title="Authorized by Institute"
                    name={certificate?.institute?.name || "Institute Admin"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @page {
          size: A4 landscape;
          margin: 6mm;
        }

        @media print {
          html,
          body {
            width: 100%;
            height: 100%;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .certificate-print-wrapper,
          .certificate-print-wrapper * {
            visibility: visible;
          }

          .certificate-print-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          .certificate-sheet {
            width: 100%;
            height: 180mm !important;
            max-height: 180mm !important;
            min-height: 180mm !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }

          .certificate-inner {
            padding: 10mm 10mm !important;
          }

          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white/80 p-4 text-center shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900 sm:text-base">
        {value}
      </p>
    </div>
  );
}

function SignatureBlock({ title, name }) {
  return (
    <div className="text-center">
      <div className="mx-auto h-px w-full max-w-xs bg-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">{name}</p>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{title}</p>
    </div>
  );
}