"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/authStore";
import instituteAdminService from "@/app/services/instituteAdminService";

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

export default function InstituteCertificatesPage() {
  const router = useRouter();
  const { token, user, institute } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const loadCertificates = async (search = "") => {
    try {
      setLoading(true);
      setPageError("");
      const res = await instituteAdminService.getCertificates({
        studentSearch: search,
      });
      setCertificates(res?.data || []);
    } catch (error) {
      setPageError(error?.response?.data?.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "INSTITUTE_ADMIN") {
      router.push("/dashboard");
      return;
    }

    loadCertificates();
  }, [mounted, token, user, router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadCertificates(studentSearch);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Institute Admin
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Certificates
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View all issued certificates inside your institute.
            </p>
          </div>

          <Link
            href="/institute-admin"
            className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            Back
          </Link>
        </div>

        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              placeholder="Search by student name or email"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />

            <button
              type="submit"
              className="rounded-2xl px-5 py-3 text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              Search
            </button>
          </form>
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
            No certificates issued yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((item) => (
              <div
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-slate-900">
                      {item.course?.title || "Course"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.course?.category || "General"}
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
                  <InfoRow label="Student" value={item.student?.name || "—"} />
                  <InfoRow label="Email" value={item.student?.email || "—"} />
                  <InfoRow label="Certificate No." value={item.certificateNo || "—"} />
                  <InfoRow label="Issued On" value={formatDate(item.issuedAt)} />
                  <InfoRow
                    label="Instructor"
                    value={item.course?.teacher?.name || "Assigned Teacher"}
                  />
                </div>
              </div>
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
      <span className="max-w-[58%] break-words text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}