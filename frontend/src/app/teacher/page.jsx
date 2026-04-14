"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
        Redirecting to teacher dashboard...
      </div>
    </div>
  );
}