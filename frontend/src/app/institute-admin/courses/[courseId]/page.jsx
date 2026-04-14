"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/app/store/authStore";
import { getCourseById } from "@/app/services/courseService";

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

const getYoutubeEmbedUrl = (url = "") => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    return "";
  } catch {
    return "";
  }
};

const getFileNameFromUrl = (url = "") => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || "";
    return decodeURIComponent(pathname.split("/").pop() || "lesson-file.pdf");
  } catch {
    return "lesson-file.pdf";
  }
};

export default function InstituteCourseContentPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, institute } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [pageError, setPageError] = useState("");

  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#f59e0b";

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageBg = useMemo(
    () => ({
      background: `
        radial-gradient(circle at top left, ${hexToRgba(primaryColor, 0.14)}, transparent 28%),
        radial-gradient(circle at top right, ${hexToRgba(secondaryColor, 0.14)}, transparent 24%),
        linear-gradient(180deg, #f8fafc 0%, #eef4ff 50%, #f8fafc 100%)
      `,
    }),
    [primaryColor, secondaryColor]
  );

  const heroStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.12)} 0%, ${hexToRgba(
        secondaryColor,
        0.12
      )} 100%)`,
      borderColor: hexToRgba(primaryColor, 0.18),
      boxShadow: `0 24px 80px ${hexToRgba(primaryColor, 0.10)}`,
    }),
    [primaryColor, secondaryColor]
  );

  const chipStyle = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.22),
      backgroundColor: hexToRgba(primaryColor, 0.10),
      color: primaryColor,
    }),
    [primaryColor]
  );

  const softCard = useMemo(
    () => ({
      borderColor: hexToRgba(primaryColor, 0.16),
      background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.05)} 0%, ${hexToRgba(
        secondaryColor,
        0.04
      )} 100%)`,
    }),
    [primaryColor, secondaryColor]
  );

  useEffect(() => {
    if (!mounted) return;

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "INSTITUTE_ADMIN") {
      router.push("/dashboard");
      return;
    }

    const loadCourse = async () => {
      try {
        setLoading(true);
        setPageError("");
        const response = await getCourseById(token, params.courseId);
        setCourse(response.data || null);
      } catch (err) {
        setPageError(err.message || "Failed to load course content");
      } finally {
        setLoading(false);
      }
    };

    if (params?.courseId) {
      loadCourse();
    }
  }, [mounted, token, user, params?.courseId, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading course content...
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
          {pageError}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-10 pt-6 sm:px-6 sm:pt-8" style={pageBg}>
      <div className="relative z-10 mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <section className="rounded-[28px] border p-5 sm:p-8" style={heroStyle}>
          <div className="flex flex-col gap-5">
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5"
              style={chipStyle}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Course Content View
              </span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {course.title}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                  {course.description || "No course description added yet."}
                </p>
              </div>

              <Link
                href="/institute-admin/courses"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Back to Courses
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <MetaBadge label="Status" value={course.status} styleObj={chipStyle} />
              <MetaBadge label="Category" value={course.category || "General"} styleObj={chipStyle} />
              <MetaBadge label="Modules" value={course.modules?.length || 0} styleObj={chipStyle} />
              <MetaBadge
                label="Teacher"
                value={course.teacher?.name || "Not assigned"}
                styleObj={chipStyle}
              />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {course.modules?.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No modules added yet.
            </div>
          ) : (
            course.modules.map((module) => (
              <div
                key={module.id}
                className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,0.05)] sm:p-6 lg:p-8"
              >
                <div className="flex flex-col gap-4">
                  <div className="min-w-0">
                    <div
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                      style={chipStyle}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                        Module {module.order}
                      </span>
                    </div>

                    <h3 className="mt-4 break-words text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      {module.title}
                    </h3>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Lessons
                    </p>

                    {module.lessons?.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                        No lessons inside this module yet.
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-4">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-base font-bold text-slate-900 sm:text-lg">
                                  {lesson.title}
                                </h4>
                                <span
                                  className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                                  style={chipStyle}
                                >
                                  {lesson.type}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-500">
                                Order: {lesson.order}
                              </p>

                              {lesson.type === "TEXT" && lesson.content && (
                                <div className="mt-4 rounded-2xl border p-4" style={softCard}>
                                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                                    Text Content
                                  </p>
                                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                    {lesson.content}
                                  </p>
                                </div>
                              )}

                              {lesson.type === "VIDEO" && lesson.videoUrl && (
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                  {getYoutubeEmbedUrl(lesson.videoUrl) ? (
                                    <iframe
                                      src={getYoutubeEmbedUrl(lesson.videoUrl)}
                                      title={lesson.title}
                                      className="aspect-video w-full"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <div className="p-4">
                                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                                        Video Link
                                      </p>
                                      <a
                                        href={lesson.videoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="break-all text-sm font-medium"
                                        style={{ color: primaryColor }}
                                      >
                                        {lesson.videoUrl}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {lesson.type === "PDF" && lesson.pdfUrl && (
                                <div
                                  className="mt-4 overflow-hidden rounded-3xl border"
                                  style={softCard}
                                >
                                  <div className="border-b border-slate-200 bg-white/80 px-4 py-3 sm:px-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                                      PDF Resource
                                    </p>
                                  </div>

                                  <div className="p-4 sm:p-5">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                      <div className="flex min-w-0 flex-1 items-start gap-3">
                                        <div
                                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                                          style={{
                                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                          }}
                                        >
                                          PDF
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                            {getFileNameFromUrl(lesson.pdfUrl)}
                                          </p>
                                          <p className="mt-1 text-sm text-slate-600">
                                            Read-only view for institute admin.
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid w-full gap-3 sm:grid-cols-1 md:w-auto">
                                        <a
                                          href={lesson.pdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
                                          style={{
                                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                          }}
                                        >
                                          View PDF
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function MetaBadge({ label, value, styleObj }) {
  return (
    <div className="rounded-full border px-4 py-2 text-sm font-semibold" style={styleObj}>
      {label}: {value}
    </div>
  );
}