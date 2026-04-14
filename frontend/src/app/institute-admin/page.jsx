"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/authStore";
import { getMyInstitute } from "../services/instituteService";
import AdminFeatureCard from "../components/AdminFeatureCard";

export default function InstituteAdminPage() {
  const router = useRouter();
  const { token, user, institute, setInstitute, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncInstitute = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      if (user?.role !== "INSTITUTE_ADMIN") {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await getMyInstitute(token);
        if (response?.data) {
          setInstitute(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch institute:", error);
      } finally {
        setLoading(false);
      }
    };

    syncInstitute();
  }, [token, user, router, setInstitute]);

  const instituteName = institute?.name || "Your Institute";
  const plan = institute?.plan || "STARTER";
  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#f59e0b";
  const subdomain = institute?.subdomain || "yourinstitute";
  const logoUrl = institute?.logoUrl?.trim();

  const actions = [
    {
      title: "Institute Settings",
      description: "Profile details, subdomain, and institute configuration.",
      href: "/institute-admin/settings",
      cta: "Open Settings",
      tone: "from-sky-100 to-cyan-50",
      available: true,
      icon: "⚙️",
    },
    {
      title: "Branding",
      description: "Logo, colors, and portal identity customization.",
      href: "/institute-admin/branding",
      cta: "Edit Branding",
      tone: "from-orange-100 to-amber-50",
      available: true,
      icon: "🎨",
    },
    {
      title: "Courses",
      description: "Create and manage courses, modules, and lessons.",
      href: "/institute-admin/courses",
      cta: "Manage Courses",
      tone: "from-emerald-100 to-green-50",
      available: true,
      icon: "📚",
    },
    {
      title: "Students & Teachers",
      description: "Manage learners and faculty inside your institute.",
      href: "/institute-admin/users",
      cta: "Manage Users",
      tone: "from-blue-100 to-indigo-50",
      available: true,
      icon: "👩‍🏫",
    },
    {
      title: "Certificates",
      description: "View all certificates issued to students in your institute.",
      href: "/institute-admin/certificates",
      cta: "View Certificates",
      tone: "from-pink-100 to-rose-50",
      available: true,
      icon: "🏆",
    },
    {
      title: "Reports",
      description: "Review enrollments, completion rates, and institute analytics.",
      href: "/institute-admin/reports",
      cta: "Open Reports",
      tone: "from-fuchsia-100 to-violet-50",
      available: true,
      icon: "📊",
    },
    {
      title: "Quizzes & Exams",
      description: "Build assessments, question banks, and results.",
      href: "#",
      cta: "Coming Soon",
      tone: "from-violet-100 to-fuchsia-50",
      available: false,
      icon: "📝",
    },
  ];

  const headerSurface = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      boxShadow: `0 24px 60px ${primaryColor}22`,
    }),
    [primaryColor, secondaryColor]
  );

  const mutedTint = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${primaryColor}14, ${secondaryColor}10)`,
      borderColor: `${primaryColor}20`,
    }),
    [primaryColor, secondaryColor]
  );

  const accentSoft = useMemo(
    () => ({
      backgroundColor: `${primaryColor}10`,
      borderColor: `${primaryColor}22`,
      color: primaryColor,
    }),
    [primaryColor]
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] text-neutral-900">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .font-display { font-family: 'Manrope', sans-serif; }
        `}</style>

        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 -right-16 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25"
            style={{ backgroundColor: `${primaryColor}30` }}
          />
          <div
            className="absolute top-1/3 -left-12 h-80 w-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: `${secondaryColor}28` }}
          />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="rounded-2xl border border-white/70 bg-white/85 px-6 py-4 text-sm font-semibold text-stone-600 shadow-lg backdrop-blur">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-neutral-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Manrope', sans-serif; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 -right-10 h-[30rem] w-[30rem] rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: `${primaryColor}34` }}
        />
        <div
          className="absolute top-1/3 -left-16 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: `${secondaryColor}3d` }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: `${primaryColor}18` }}
        />
      </div>

      <div className="relative z-10">
        <header className="border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Institute Admin
              </p>
              <h1 className="font-display mt-1 truncate text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
                {instituteName}
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Logged in as
                </p>
                <p className="mt-0.5 text-sm font-semibold text-neutral-800">
                  {user?.name || "Institute Admin"}
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
                      <h2 className="font-display truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
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
                    <p className="mt-1 text-sm font-semibold">Institute Admin</p>
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
                  <p className="mt-2 truncate text-lg font-bold">
                    {subdomain}.b2world.in
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/15 bg-white/12 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                    Workspace
                  </p>
                  <p className="mt-2 text-lg font-bold">Active</p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-4">
                <Link
                  href="/institute-admin/courses"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Go to Courses
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
                  href="/institute-admin/settings"
                  className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Open Settings
                </Link>
              </div>
            </div>
          </section>

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

              <h3 className="font-display mt-6 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                Welcome back, {user?.name || "Admin"}
              </h3>

              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
                Manage institute operations, access key modules, and continue
                daily administration from one central workspace.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div
                  className="rounded-[24px] border p-5 shadow-sm"
                  style={mutedTint}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Plan
                  </p>
                  <p className="mt-2 text-lg font-bold text-neutral-900">{plan}</p>
                </div>

                <div
                  className="rounded-[24px] border p-5 shadow-sm"
                  style={mutedTint}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Portal
                  </p>
                  <p className="mt-2 truncate text-lg font-bold text-neutral-900">
                    {subdomain}.b2world.in
                  </p>
                </div>

                <div
                  className="rounded-[24px] border p-5 shadow-sm"
                  style={mutedTint}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Role
                  </p>
                  <p className="mt-2 text-lg font-bold text-neutral-900">
                    Institute Admin
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white/88 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)] backdrop-blur sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Institute Profile
                  </p>
                  <h4 className="font-display mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">
                    Summary
                  </h4>
                </div>

                <div
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                  style={accentSoft}
                >
                  Active
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div
                  className="rounded-[24px] border p-4"
                  style={mutedTint}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Institute Name
                  </p>
                  <p className="mt-2 truncate text-base font-bold text-neutral-900">
                    {instituteName}
                  </p>
                </div>

                <div
                  className="rounded-[24px] border p-4"
                  style={mutedTint}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Subdomain
                  </p>
                  <p className="mt-2 truncate text-base font-bold text-neutral-900">
                    {subdomain}.b2world.in
                  </p>
                </div>

                <div
                  className="rounded-[24px] border p-4"
                  style={mutedTint}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Subscription
                  </p>
                  <p className="mt-2 text-base font-bold text-neutral-900">{plan}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Workspace
                </p>
                <h3 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
                  Modules
                </h3>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {actions.map((item) => (
                <AdminFeatureCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  cta={item.cta}
                  tone={item.tone}
                  available={item.available}
                  icon={item.icon}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}