"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/authStore";
import { getCourses, getMyCourses, enrollInCourse } from "@/app/services/courseService";


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

export default function StudentDashboardPage() {
  const router = useRouter();
  const { token, user, institute, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState("");
  const [pageError, setPageError] = useState("");
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [coursesRes, myCoursesRes] = await Promise.all([
        getCourses(token),
        getMyCourses(token),
      ]);

      setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : []);
      setMyCourses(Array.isArray(myCoursesRes?.data) ? myCoursesRes.data : []);
    } catch (error) {
      setPageError(error?.message || "Failed to load student dashboard");
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

    if (user?.role && user.role !== "STUDENT") {
      if (user.role === "TEACHER") router.push("/teacher");
      else if (user.role === "INSTITUTE_ADMIN") router.push("/institute-admin");
      else if (user.role === "SUPER_ADMIN") router.push("/super-admin");
      else router.push("/dashboard");
      return;
    }

    loadAll();
  }, [mounted, token, user, router]);

  const instituteName = mounted ? institute?.name || "Institute" : "Institute";
  const subdomain = mounted ? institute?.subdomain || "portal" : "portal";
  const plan = mounted ? institute?.plan || "STARTER" : "STARTER";
  const logoUrl = mounted ? institute?.logoUrl || "" : "";
  const primaryColor = mounted ? institute?.primaryColor || "#111827" : "#111827";
  const secondaryColor = mounted ? institute?.secondaryColor || "#334155" : "#334155";

  const headerSurface = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    }),
    [primaryColor, secondaryColor]
  );

  const accentSoft = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.2),
      backgroundColor: hexToRgba(primaryColor, 0.1),
      color: primaryColor,
    }),
    [primaryColor]
  );

  const mutedTint = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.15),
      backgroundColor: hexToRgba(primaryColor, 0.06),
    }),
    [primaryColor]
  );

  const publishedCourses = courses.filter((course) => course.status === "PUBLISHED");
  const totalModules = courses.reduce(
    (sum, course) => sum + (course?._count?.modules || 0),
    0
  );

  const handleLogout = () => {
    logout?.();
    router.push("/login");
  };

  const handleEnroll = async (courseId) => {
  try {
    setEnrollingId(courseId);
    await enrollInCourse(token, courseId);
    await loadAll();
  } catch (error) {
    alert(error?.message || "Failed to enroll in course");
  } finally {
    setEnrollingId("");
  }
};

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          Loading student workspace...
        </div>
      </div>
    );
  }

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
                Student Workspace
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
                  {user?.name || "Student"}
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
            className="rounded-4xl p-1 shadow-[0_18px_60px_rgba(0,0,0,0.08)]"
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
                    <p className="mt-1 text-sm font-semibold">Student</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="mt-8 rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
              Loading student dashboard...
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
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                      Overview
                    </span>
                  </div>

                  <h3 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                    Welcome, {user?.name || "Student"}
                  </h3>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
                    Browse institute courses, enroll, and access only your enrolled content.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <StatCard title="Published Courses" value={publishedCourses.length} tint={mutedTint} />
                    <StatCard title="My Courses" value={myCourses.length} tint={mutedTint} />
                    <StatCard title="Modules" value={totalModules} tint={mutedTint} />
                  </div>
                </div>

                <div className="rounded-[30px] border border-slate-200 bg-white/88 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)] backdrop-blur sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Student Summary
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
                    <SummaryRow label="Institute Plan" value={plan} />
                    <SummaryRow label="Portal" value={`${subdomain}.b2world.in`} />
                    <SummaryRow label="My Enrollments" value={myCourses.length} />
                    <SummaryRow label="Published Courses" value={publishedCourses.length} />
                    <SummaryRow label="Role" value="Student" />
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    My Learning
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">
                    My Courses
                  </h3>
                </div>

                {myCourses.length === 0 ? (
                  <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                    You have not enrolled in any courses yet.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {myCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/student/courses/${course.id}`}
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
                            Enrolled
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <MiniCard label="Modules" value={course._count?.modules || 0} tint={mutedTint} />
                          <MiniCard label="Teacher" value={course.teacher?.name || "Not assigned"} tint={mutedTint} />
                        </div>
                      </Link>
                      
                    ))}
                    <Link
  href="/student/certificates"
  className="inline-flex items-center rounded-2xl border px-5 py-3 text-sm font-semibold"
  style={accentSoft}
>
  My Certificates
</Link>
                  </div>

                )}

              </section>

              <section className="mt-8">
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Institute Catalog
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">
                    Available Courses
                  </h3>
                </div>

                {publishedCourses.length === 0 ? (
                  <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                    No published courses available yet.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {publishedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
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

                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                          {course.description || "No description added yet."}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <MiniCard label="Modules" value={course._count?.modules || 0} tint={mutedTint} />
                          <MiniCard label="Teacher" value={course.teacher?.name || "Not assigned"} tint={mutedTint} />
                        </div>

                        <div className="mt-5">
                          {course.isEnrolled ? (
                            <Link
                              href={`/student/courses/${course.id}`}
                              className="inline-flex rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Open Course
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrollingId === course.id}
                              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {enrollingId === course.id ? "Enrolling..." : "Enroll Now"}
                            </button>
                          )}
                        </div>
                      </div>
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
      <p className="mt-2 truncate text-base font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function StatCard({ title, value, tint }) {
  return (
    <div className="rounded-3xl border p-5 shadow-sm" style={tint}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-lg font-bold text-neutral-900">{value}</p>
    </div>
  );
}