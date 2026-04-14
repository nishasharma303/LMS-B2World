"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import teacherService from "@/app/services/teacherService";
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

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, institute, logout } = useAuthStore();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const instituteName = institute?.name || "Institute";
  const subdomain = institute?.subdomain || "portal";
  const plan = institute?.plan || "STARTER";
  const logoUrl = institute?.logoUrl || "";
  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#334155";

  const headerSurface = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    }),
    [primaryColor, secondaryColor]
  );

  const accentSoft = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.22),
      backgroundColor: hexToRgba(primaryColor, 0.08),
      color: primaryColor,
    }),
    [primaryColor]
  );

  const mutedTint = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.14),
      backgroundColor: hexToRgba(primaryColor, 0.05),
    }),
    [primaryColor]
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setPageError("");
        const res = await teacherService.getDashboard();
        setDashboard(res.data);
      } catch (error) {
        setPageError(error?.response?.data?.message || "Failed to load teacher dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout?.();
    router.push("/login");
  };

  const stats = dashboard?.stats || {};
  const recentCourses = dashboard?.recentCourses || [];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div
        className="pointer-events-none fixed inset-0 opacity-80"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(circle at top left, ${hexToRgba(primaryColor, 0.14)}, transparent 28%),
            radial-gradient(circle at top right, ${hexToRgba(secondaryColor, 0.14)}, transparent 24%),
            linear-gradient(to bottom, #f8fafc, #eef2f7)
          `,
        }}
      />

      <div className="relative z-10">
        <header className="border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Teacher Workspace
              </p>
              <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
                {instituteName}
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Logged in as
                </p>
                <p className="mt-0.5 text-sm font-semibold text-neutral-800">
                  {user?.name || "Teacher"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: primaryColor }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 md:pt-10">
          <section
            className="rounded-[32px] p-1 shadow-[0_18px_60px_rgba(0,0,0,0.08)]"
            style={headerSurface}
          >
            <div className="rounded-[28px] bg-white/8 p-6 backdrop-blur-xl sm:p-7 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Institute logo"
                        className="h-16 w-16 rounded-[20px] border border-white/20 bg-white object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/20 bg-white/15 text-2xl font-bold text-white shadow-sm">
                        {instituteName?.charAt(0)?.toUpperCase() || "I"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        Dashboard
                      </p>
                      <h2 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
                        {instituteName}
                      </h2>
                      <p className="mt-1 truncate text-sm text-white/80 sm:text-base">
                        {subdomain}.b2world.in
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/12 px-4 py-3 text-white backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
                      Plan
                    </p>
                    <p className="mt-1 text-sm font-semibold">{plan}</p>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/12 px-4 py-3 text-white backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
                      Access
                    </p>
                    <p className="mt-1 text-sm font-semibold">Teacher</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/15 bg-white/12 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                    Institute
                  </p>
                  <p className="mt-2 truncate text-lg font-bold">{instituteName}</p>
                </div>

                <div className="rounded-[24px] border border-white/15 bg-white/12 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                    Portal
                  </p>
                  <p className="mt-2 truncate text-lg font-bold">{subdomain}.b2world.in</p>
                </div>

                <div className="rounded-[24px] border border-white/15 bg-white/12 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                    Workspace
                  </p>
                  <p className="mt-2 text-lg font-bold">Teaching</p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-4">
                <Link
                  href="/teacher/courses"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Go to My Courses
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/teacher/profile"
                  className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Open Profile
                </Link>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="mt-8 rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
              Loading dashboard...
            </div>
          ) : pageError ? (
            <div className="mt-8 rounded-[30px] border border-red-200 bg-red-50 p-8 text-red-600 shadow-sm">
              {pageError}
            </div>
          ) : (
            <>
              <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[30px] border border-slate-200 bg-white/88 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.05)] backdrop-blur sm:p-8">
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                    style={accentSoft}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                      Overview
                    </span>
                  </div>

                  <h3 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                    Welcome back, {user?.name || "Teacher"}
                  </h3>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
                    Access your assigned courses, organize modules, and manage learning content
                    from the institute’s branded teaching workspace.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border p-5 shadow-sm" style={mutedTint}>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Assigned Courses
                      </p>
                      <p className="mt-2 text-lg font-bold text-neutral-900">
                        {stats.assignedCourses || 0}
                      </p>
                    </div>

                    <div className="rounded-[24px] border p-5 shadow-sm" style={mutedTint}>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Modules
                      </p>
                      <p className="mt-2 text-lg font-bold text-neutral-900">
                        {stats.modulesCount || 0}
                      </p>
                    </div>

                    <div className="rounded-[24px] border p-5 shadow-sm" style={mutedTint}>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Lessons
                      </p>
                      <p className="mt-2 text-lg font-bold text-neutral-900">
                        {stats.lessonsCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-slate-200 bg-white/88 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)] backdrop-blur sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Teaching Summary
                      </p>
                      <h4 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">
                        Snapshot
                      </h4>
                    </div>

                    <div
                      className="rounded-full border px-3 py-1 text-xs font-semibold"
                      style={accentSoft}
                    >
                      Active
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <SummaryRow label="Published Courses" value={stats.publishedCourses || 0} />
                    <SummaryRow label="Draft Courses" value={stats.draftCourses || 0} />
                    <SummaryRow label="Institute Plan" value={plan} />
                    <SummaryRow label="Portal" value={`${subdomain}.b2world.in`} />
                    <SummaryRow label="Role" value="Teacher" />
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      My Courses
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">
                      Recently Assigned
                    </h3>
                  </div>

                  <Link
                    href="/teacher/courses"
                    className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    View All Courses
                  </Link>
                </div>

                {recentCourses.length === 0 ? (
                  <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                    No courses assigned yet.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {recentCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/teacher/courses/${course.id}`}
                        className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-lg font-bold text-neutral-900">
                              {course.title}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              {course.category || "General"}
                            </p>
                          </div>

                          <div
                            className="rounded-full border px-3 py-1 text-xs font-semibold"
                            style={accentSoft}
                          >
                            {course.status}
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <MiniCard label="Modules" value={course._count?.modules || 0} tint={mutedTint} />
                          <MiniCard label="Access" value="Workspace" tint={mutedTint} />
                        </div>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: primaryColor }}>
                          Open course
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function MiniCard({ label, value, tint }) {
  return (
    <div className="rounded-2xl border p-4" style={tint}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-bold text-neutral-900">{value}</p>
    </div>
  );
}