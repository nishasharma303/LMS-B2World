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

export default function InstituteReportsPage() {
  const router = useRouter();
  const { token, user, institute } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [report, setReport] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#334155";

  const pageBg = useMemo(
    () => ({
      background: `
        radial-gradient(circle at top left, ${hexToRgba(primaryColor, 0.10)}, transparent 28%),
        radial-gradient(circle at top right, ${hexToRgba(secondaryColor, 0.10)}, transparent 24%),
        linear-gradient(to bottom, #f8fafc, #eef2f7)
      `,
    }),
    [primaryColor, secondaryColor]
  );

  const cardTint = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.16),
      background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.06)} 0%, ${hexToRgba(
        secondaryColor,
        0.04
      )} 100%)`,
    }),
    [primaryColor, secondaryColor]
  );

  const loadReports = async () => {
    try {
      setLoading(true);
      setPageError("");
      const res = await instituteAdminService.getReportsOverview();
      setReport(res?.data || null);
    } catch (error) {
      setPageError(error?.response?.data?.message || "Failed to load reports");
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

    loadReports();
  }, [mounted, token, user, router]);

  if (!mounted) return null;

  const overview = report?.overview || {};
  const topCourses = report?.topCourses || [];
  const recentCertificates = report?.recentCertificates || [];
  const recentEnrollments = report?.recentEnrollments || [];

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={pageBg}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Institute Admin
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Reports
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Basic institute analytics built from courses, enrollments, progress, and certificates.
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

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            Loading reports...
          </div>
        ) : pageError ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-red-600 shadow-sm">
            {pageError}
          </div>
        ) : (
          <>
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Students" value={overview.totalStudents || 0} tint={cardTint} />
              <StatCard title="Teachers" value={overview.totalTeachers || 0} tint={cardTint} />
              <StatCard title="Courses" value={overview.totalCourses || 0} tint={cardTint} />
              <StatCard title="Published" value={overview.publishedCourses || 0} tint={cardTint} />
              <StatCard title="Enrollments" value={overview.totalEnrollments || 0} tint={cardTint} />
              <StatCard title="Certificates" value={overview.totalCertificates || 0} tint={cardTint} />
              <StatCard title="Completion Rate" value={`${overview.completionRate || 0}%`} tint={cardTint} />
              <StatCard title="Certificate Rate" value={`${overview.certificateRate || 0}%`} tint={cardTint} />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Top Courses
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                  Most Enrolled Courses
                </h2>

                {topCourses.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    No course analytics available yet.
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {topCourses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">
                              {course.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {course.category || "General"} • {course.teacher?.name || "No teacher"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {course._count?.enrollments || 0} enrollments
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {course._count?.certificates || 0} certificates
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Recent Certificates
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    Latest Issued
                  </h2>

                  {recentCertificates.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                      No recent certificates yet.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {recentCertificates.map((item, index) => (
                        <SimpleRow
                          key={index}
                          title={item.student?.name || "Student"}
                          subtitle={item.course?.title || "Course"}
                          meta={formatDate(item.issuedAt)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Recent Enrollments
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    Latest Joined
                  </h2>

                  {recentEnrollments.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                      No recent enrollments yet.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {recentEnrollments.map((item, index) => (
                        <SimpleRow
                          key={index}
                          title={item.student?.name || "Student"}
                          subtitle={item.course?.title || "Course"}
                          meta={formatDate(item.enrolledAt)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, tint }) {
  return (
    <div className="rounded-[24px] border p-5 shadow-sm" style={tint}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function SimpleRow({ title, subtitle, meta }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 truncate text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="text-xs font-medium text-slate-500">{meta}</span>
      </div>
    </div>
  );
}