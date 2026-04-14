"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/app/store/authStore";
import { getCourseById, markLessonComplete } from "@/app/services/courseService";
import {
  getCertificateEligibility,
  generateCertificate,
} from "@/app/services/certificateService";

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

export default function StudentCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, institute } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [pageError, setPageError] = useState("");
  const [progressLoadingId, setProgressLoadingId] = useState("");
  const [certificateLoading, setCertificateLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadCourse = async () => {
    const [courseRes, eligibilityRes] = await Promise.all([
      getCourseById(token, params.courseId),
      getCertificateEligibility(token, params.courseId),
    ]);

    setCourse(courseRes.data);
    setEligibility(eligibilityRes.data);
  };

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

    const init = async () => {
      try {
        setLoading(true);
        setPageError("");
        await loadCourse();
      } catch (error) {
        setPageError(error?.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (params?.courseId) {
      init();
    }
  }, [mounted, token, user, params?.courseId, router]);

  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#334155";

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

  const handleMarkComplete = async (lessonId) => {
    try {
      setProgressLoadingId(lessonId);
      await markLessonComplete(token, lessonId);
      await loadCourse();
    } catch (error) {
      alert(error?.message || "Failed to update progress");
    } finally {
      setProgressLoadingId("");
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      setCertificateLoading(true);
      const res = await generateCertificate(token, params.courseId);
      const certificateId = res?.data?.id;
      await loadCourse();

      if (certificateId) {
        router.push(`/student/certificates/${certificateId}`);
      }
    } catch (error) {
      alert(error?.message || "Failed to generate certificate");
    } finally {
      setCertificateLoading(false);
    }
  };

  if (!mounted) {
    return <div className="p-6">Loading course...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Student Course
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
              {course?.title || "Course Details"}
            </h1>
          </div>

          <Link
            href="/student"
            className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Back
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            Loading course...
          </div>
        ) : pageError ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-red-600 shadow-sm">
            {pageError}
          </div>
        ) : !course ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            Course not found.
          </div>
        ) : (
          <>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">{course.title}</h2>
                  <p className="mt-2 text-slate-600">
                    {course.description || "No description added yet."}
                  </p>
                </div>

                <div
                  className="rounded-full border px-4 py-2 text-sm font-semibold"
                  style={accentSoft}
                >
                  {course.isEnrolled ? "Enrolled" : "Not Enrolled"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <InfoCard label="Category" value={course.category || "General"} tint={mutedTint} />
                <InfoCard label="Teacher" value={course.teacher?.name || "Not assigned"} tint={mutedTint} />
                <InfoCard label="Enrollments" value={course._count?.enrollments || 0} tint={mutedTint} />
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Course Completion Certificate
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      Earn your certificate
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Complete all lessons in this course to unlock your institute-issued certificate.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {eligibility?.certificate?.id ? (
                      <Link
                        href={`/student/certificates/${eligibility.certificate.id}`}
                        className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        View Certificate
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGenerateCertificate}
                        disabled={!eligibility?.eligible || certificateLoading}
                        className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {certificateLoading ? "Generating..." : "Generate Certificate"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <InfoCard
                    label="Completed Lessons"
                    value={`${eligibility?.completedLessons || 0} / ${eligibility?.totalLessons || 0}`}
                    tint={mutedTint}
                  />
                  <InfoCard
                    label="Progress"
                    value={`${eligibility?.percentage || 0}%`}
                    tint={mutedTint}
                  />
                  <InfoCard
                    label="Eligible"
                    value={eligibility?.eligible ? "Yes" : "No"}
                    tint={mutedTint}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {course.modules?.length ? (
                course.modules.map((module) => (
                  <div
                    key={module.id}
                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          Module {module.order}
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-neutral-900">
                          {module.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {module.lessons?.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="text-lg font-semibold text-neutral-900">
                                  {lesson.title}
                                </h4>
                                <span
                                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                                  style={accentSoft}
                                >
                                  {lesson.type}
                                </span>
                                {lesson.completed && (
                                  <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                    Completed
                                  </span>
                                )}
                              </div>

                              <div className="mt-4">
                                {lesson.type === "TEXT" && (
                                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                                    {lesson.content || "No text content available."}
                                  </div>
                                )}

                                {lesson.type === "VIDEO" && lesson.videoUrl && (
                                  <a
                                    href={lesson.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex rounded-2xl border px-4 py-2.5 text-sm font-semibold"
                                    style={accentSoft}
                                  >
                                    Open Video
                                  </a>
                                )}

                                {lesson.type === "PDF" && lesson.pdfUrl && (
                                  <a
                                    href={lesson.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex rounded-2xl border px-4 py-2.5 text-sm font-semibold"
                                    style={accentSoft}
                                  >
                                    Open PDF
                                  </a>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleMarkComplete(lesson.id)}
                              disabled={lesson.completed || progressLoadingId === lesson.id}
                              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {lesson.completed
                                ? "Completed"
                                : progressLoadingId === lesson.id
                                ? "Saving..."
                                : "Mark Complete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                  No modules available in this course yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value, tint }) {
  return (
    <div className="rounded-2xl border p-4" style={tint}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-bold text-neutral-900">{value}</p>
    </div>
  );
}