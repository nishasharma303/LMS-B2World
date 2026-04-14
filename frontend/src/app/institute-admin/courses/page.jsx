"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/authStore";
import CourseForm from "../../components/CourseForm";
import CourseList from "../../components/CourseList";
import {
  createCourse,
  deleteCourse,
  getCourses,
} from "../../services/courseService";

export default function InstituteCoursesPage() {
  const router = useRouter();
  const { token, user, institute } = useAuthStore();

  const [isReady, setIsReady] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const instituteName = institute?.name || "Your Institute";
  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#f59e0b";
  const subdomain = institute?.subdomain || "yourinstitute";

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!token || !user) {
      setLoadingPage(false);
      router.push("/login");
      return;
    }

    if (user.role !== "INSTITUTE_ADMIN") {
      setLoadingPage(false);
      router.push("/login");
      return;
    }

    const loadCourses = async () => {
      try {
        setLoadingPage(true);
        setError("");

        const response = await getCourses(token);
        setCourses(response.data || []);
      } catch (err) {
        setError(err.message || "Failed to load courses");
      } finally {
        setLoadingPage(false);
      }
    };

    loadCourses();
  }, [isReady, token, user, router]);

  const handleCreateCourse = async (formData) => {
    try {
      if (!token) {
        router.push("/login");
        return;
      }

      setCreating(true);
      setError("");
      setSuccess("");

      const response = await createCourse(token, formData);
      const newCourse = response.data;

      setCourses((prev) => [newCourse, ...prev]);
      setSuccess("Course created successfully.");
    } catch (err) {
      setError(err.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      if (!token) {
        router.push("/login");
        return;
      }

      setDeletingId(courseId);
      setError("");
      setSuccess("");

      await deleteCourse(token, courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      setSuccess("Course deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete course");
    } finally {
      setDeletingId("");
    }
  };

  if (!isReady || loadingPage) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="w-fit rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-600 shadow-sm">
            Loading courses...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-neutral-900">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 right-0 h-96 w-96 rounded-full blur-3xl opacity-35"
          style={{ backgroundColor: `${primaryColor}40` }}
        />
        <div
          className="absolute top-1/3 -left-10 h-80 w-80 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: `${secondaryColor}35` }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)] backdrop-blur sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/institute-admin"
              className="inline-flex items-center text-sm font-semibold text-stone-500 transition hover:text-neutral-800"
            >
              ← Back to Dashboard
            </Link>

            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Course Management
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              {instituteName} Courses
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              Create and manage institute-specific courses for{" "}
              <span className="font-semibold">{subdomain}.b2world.in</span>.
            </p>
          </div>

          <div
            className="rounded-[26px] p-5 text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">
              Total Courses
            </p>
            <p className="mt-2 text-4xl font-black">{courses.length}</p>
            <p className="mt-2 text-sm text-white/80">
              Institute can also view teacher-added content.
            </p>
          </div>
        </div>

        {(error || success) && (
          <div className="mb-6 space-y-3">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            ) : null}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <CourseForm
            onSubmit={handleCreateCourse}
            loading={creating}
            primaryColor={primaryColor}
          />

          <div className="rounded-[28px] border border-stone-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                  Overview
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-neutral-900">
                  Course snapshot
                </h3>
              </div>

              <div
                className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {courses.length} courses
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                  Published
                </p>
                <p className="mt-2 text-3xl font-black text-neutral-900">
                  {courses.filter((c) => c.status === "PUBLISHED").length}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                  Draft
                </p>
                <p className="mt-2 text-3xl font-black text-neutral-900">
                  {courses.filter((c) => c.status === "DRAFT").length}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                  What next
                </p>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  Institute admin can now create courses, assign teachers, and
                  also open a read-only view of full course content added by teachers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              All Courses
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-900">
              Course library
            </h2>
          </div>

          <CourseList
            courses={courses}
            primaryColor={primaryColor}
            onDelete={handleDeleteCourse}
            deletingId={deletingId}
            showViewContent
            baseViewHref="/institute-admin/courses"
          />
        </section>
      </div>
    </div>
  );
}