"use client";

import Link from "next/link";

export default function AdminFeatureCard({
  title,
  description,
  href,
  cta,
  tone,
  available = false,
  icon = "✨",
  primaryColor = "#111827",
}) {
  return (
    <div
      className={`group rounded-[30px] border border-stone-200 bg-gradient-to-br ${tone} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-xl shadow-sm">
            {icon}
          </div>

          <p className="text-lg font-bold tracking-tight text-neutral-900">
            {title}
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-600">{description}</p>
        </div>

        <div
          className="hidden h-3 w-3 rounded-full sm:block"
          style={{ backgroundColor: available ? primaryColor : "#a8a29e" }}
        />
      </div>

      {available ? (
        <Link
          href={href}
          className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: primaryColor }}
        >
          {cta}
        </Link>
      ) : (
        <span className="mt-6 inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-500">
          {cta}
        </span>
      )}
    </div>
  );
}