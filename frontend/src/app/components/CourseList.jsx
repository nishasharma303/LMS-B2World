"use client";

import Link from "next/link";

export default function CourseList({
  courses = [],
  primaryColor = "#111827",
  onDelete,
  deletingId = "",
  showViewContent = false,
  baseViewHref = "/institute-admin/courses",
}) {
  if (!courses.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/90 p-10 text-center text-stone-500 shadow-sm">
        No courses found yet.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="rounded-[28px] border border-stone-200 bg-white/95 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-black tracking-tight text-neutral-900">
                {course.title}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                {course.category || "General"}
              </p>
            </div>

            <div
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {course.status}
            </div>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-stone-600">
            {course.description || "No course description added yet."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                Teacher
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">
                {course.teacher?.name || "Not assigned"}
              </p>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                Modules
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">
                {course._count?.modules || 0}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {showViewContent ? (
              <Link
                href={`${baseViewHref}/${course.id}`}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                View Content
              </Link>
            ) : null}

            <button
              onClick={() => onDelete?.(course.id)}
              disabled={deletingId === course.id}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              {deletingId === course.id ? "Deleting..." : "Delete Course"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}