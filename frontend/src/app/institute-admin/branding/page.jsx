"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/authStore";
import { getMyInstitute, updateInstitute } from "../../services/instituteService";
import { getCourses } from "../../services/courseService";

export default function InstituteBrandingPage() {
  const router = useRouter();
  const { token, user, institute, setInstitute, logout } = useAuthStore();

  const [branding, setBranding] = useState({
    name: "",
    subdomain: "",
    logoUrl: "",
    primaryColor: "#111827",
    secondaryColor: "#f59e0b",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "INSTITUTE_ADMIN") {
      router.push("/login");
      return;
    }

    fetchInstituteAndPreviewData();
  }, [token, user]);

  const fetchInstituteAndPreviewData = async () => {
    try {
      setLoading(true);
      setError("");

      const [instituteResponse, coursesResponse] = await Promise.all([
        getMyInstitute(token),
        getCourses(token).catch(() => ({ data: [] })),
      ]);

      const instituteData = instituteResponse?.data || {};
      const courseData = Array.isArray(coursesResponse?.data)
        ? coursesResponse.data
        : [];

      setInstitute(instituteData);

      setBranding({
        name: instituteData?.name || "",
        subdomain: instituteData?.subdomain || "",
        logoUrl: instituteData?.logoUrl || "",
        primaryColor: instituteData?.primaryColor || "#111827",
        secondaryColor: instituteData?.secondaryColor || "#f59e0b",
      });

      setCourseCount(courseData.length);

      const derivedStudentCount =
        instituteData?.studentCount ??
        instituteData?._count?.students ??
        instituteData?._count?.users ??
        (Array.isArray(instituteData?.users)
          ? instituteData.users.filter((member) => member?.role === "STUDENT").length
          : 0);

      setStudentCount(derivedStudentCount);
    } catch (err) {
      setError(err.message || "Failed to load branding.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "subdomain") {
      setBranding((prev) => ({
        ...prev,
        subdomain: value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      }));
      return;
    }

    setBranding((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveBranding = async () => {
    if (!institute?.id) {
      setError("Institute not found.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await updateInstitute(
        institute.id,
        {
          name: branding.name.trim(),
          subdomain: branding.subdomain.trim(),
          logoUrl: branding.logoUrl.trim() || null,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
        },
        token
      );

      const updatedInstitute = response.data;
      setInstitute(updatedInstitute);

      setBranding((prev) => ({
        ...prev,
        name: updatedInstitute?.name || prev.name,
        subdomain: updatedInstitute?.subdomain || prev.subdomain,
        logoUrl: updatedInstitute?.logoUrl || "",
        primaryColor: updatedInstitute?.primaryColor || prev.primaryColor,
        secondaryColor: updatedInstitute?.secondaryColor || prev.secondaryColor,
      }));

      setMessage("Branding saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save branding.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const instituteName = branding.name || "Your Institute";
  const instituteSubdomain = branding.subdomain || "yourinstitute";
  const logoUrl = branding.logoUrl?.trim();

  const gradientStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
    }),
    [branding.primaryColor, branding.secondaryColor]
  );

  const glowStyle = useMemo(
    () => ({
      boxShadow: `0 24px 60px ${branding.primaryColor}26`,
    }),
    [branding.primaryColor]
  );

  const softTint = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${branding.primaryColor}12, ${branding.secondaryColor}10)`,
      borderColor: `${branding.primaryColor}20`,
    }),
    [branding.primaryColor, branding.secondaryColor]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1] px-4">
        <div className="rounded-[28px] border border-stone-200 bg-white px-6 py-4 text-sm font-semibold text-stone-600 shadow-sm">
          Loading branding...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-neutral-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-16 -right-10 h-80 w-80 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: `${branding.primaryColor}55` }}
        />
        <div
          className="absolute top-1/3 -left-12 h-72 w-72 rounded-full blur-3xl opacity-25"
          style={{ backgroundColor: `${branding.secondaryColor}55` }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: `${branding.primaryColor}30` }}
        />
      </div>

      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f8f6f1]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Institute Branding
            </p>
            <h1 className="font-display mt-1 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
              Customize your portal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/institute-admin")}
              className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Back
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <section className="rounded-[32px] border border-stone-200 bg-white/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur sm:p-7">
            <div className="mb-7">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={softTint}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: branding.secondaryColor }}
                />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  Brand Studio
                </span>
              </div>

              <h2 className="font-display mt-4 text-2xl font-black tracking-tight text-neutral-900 sm:text-[1.75rem]">
                Visual identity
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Set the look and feel of your institute portal with a more polished,
                premium branded experience.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Institute name
                </label>
                <input
                  type="text"
                  name="name"
                  value={branding.name}
                  onChange={handleChange}
                  placeholder="Enter institute name"
                  className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-stone-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Subdomain
                </label>
                <input
                  type="text"
                  name="subdomain"
                  value={branding.subdomain}
                  onChange={handleChange}
                  placeholder="abc"
                  className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-stone-400 focus:bg-white"
                />
                <p className="mt-2 text-xs font-medium text-stone-500">
                  {instituteSubdomain}.b2world.in
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Logo URL
                </label>
                <input
                  type="text"
                  name="logoUrl"
                  value={branding.logoUrl}
                  onChange={handleChange}
                  placeholder="Paste logo image URL"
                  className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-stone-400 focus:bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Primary color
                  </label>
                  <div className="flex items-center gap-3 rounded-[20px] border border-stone-200 bg-stone-50 px-3 py-2">
                    <input
                      type="color"
                      name="primaryColor"
                      value={branding.primaryColor}
                      onChange={handleChange}
                      className="h-10 w-11 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      value={branding.primaryColor}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm text-neutral-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Accent color
                  </label>
                  <div className="flex items-center gap-3 rounded-[20px] border border-stone-200 bg-stone-50 px-3 py-2">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={branding.secondaryColor}
                      onChange={handleChange}
                      className="h-10 w-11 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      name="secondaryColor"
                      value={branding.secondaryColor}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm text-neutral-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {message ? (
                <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                onClick={handleSaveBranding}
                disabled={saving}
                className="w-full rounded-full px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {saving ? "Saving..." : "Save Branding"}
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div
              className="overflow-hidden rounded-[36px] border border-stone-200 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.05)]"
              style={glowStyle}
            >
              <div className="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8" style={gradientStyle}>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-16 left-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Institute logo"
                        className="h-16 w-16 rounded-[22px] border border-white/20 bg-white object-cover shadow-md"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/15 text-2xl font-bold text-white">
                        {instituteName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="text-white">
                      <p className="text-sm font-medium text-white/75">Institute Portal</p>
                      <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                        {instituteName}
                      </h2>
                      <p className="mt-1 text-sm text-white/80">
                        {instituteSubdomain}.b2world.in
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm">
                      View Courses
                    </button>
                    <button className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
                      Sign In
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-stone-200 bg-[#fcfbf8] px-5 py-4 sm:px-8">
                <div className="flex flex-wrap gap-3">
                  {["Home", "Courses", "Faculty", "About", "Contact"].map((item, index) => (
                    <button
                      key={item}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        index === 0
                          ? "text-white"
                          : "border border-stone-200 bg-white text-neutral-700"
                      }`}
                      style={index === 0 ? { backgroundColor: branding.primaryColor } : {}}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-6">
                  <div
                    className="rounded-[28px] border p-6 sm:p-7"
                    style={softTint}
                  >
                    <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: branding.secondaryColor }}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Branded Experience
                      </span>
                    </div>

                    <h3 className="font-display mt-5 text-3xl font-black leading-tight tracking-tight text-neutral-900 sm:text-4xl">
                      A modern LMS portal for{" "}
                      <span style={{ color: branding.secondaryColor }}>
                        {instituteName}
                      </span>
                    </h3>

                    <p className="mt-4 max-w-xl text-base leading-8 text-stone-600">
                      Create a polished learning space with your own institute identity,
                      custom theme colors, and a clean student-first experience that feels
                      like a real premium platform.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <button
                        className="rounded-full px-6 py-3 text-sm font-semibold text-white transition"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        Explore Programs
                      </button>
                      <button className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-stone-400 hover:bg-stone-50">
                        Request Demo
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-medium text-stone-500">Courses</p>
                      <p className="mt-2 text-3xl font-black text-neutral-900">
                        {courseCount}
                      </p>
                      <div
                        className="mt-4 h-2 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                        }}
                      />
                    </div>

                    <div className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-medium text-stone-500">Students</p>
                      <p className="mt-2 text-3xl font-black text-neutral-900">
                        {studentCount}
                      </p>
                      <div
                        className="mt-4 h-2 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${branding.secondaryColor}, ${branding.primaryColor})`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                      Preview Palette
                    </p>
                    <div className="mt-4 flex gap-3">
                      <div
                        className="flex-1 rounded-[22px] p-4"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        <p className="text-xs font-semibold text-white/80">Primary</p>
                        <p className="mt-3 text-sm font-bold text-white">
                          {branding.primaryColor}
                        </p>
                      </div>
                      <div
                        className="flex-1 rounded-[22px] p-4"
                        style={{ backgroundColor: branding.secondaryColor }}
                      >
                        <p className="text-xs font-semibold text-white/80">Accent</p>
                        <p className="mt-3 text-sm font-bold text-white">
                          {branding.secondaryColor}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-stone-200 bg-[#fcfbf8] p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                      Quick View
                    </p>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
                        <span className="text-sm font-medium text-stone-500">Institute</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {instituteName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
                        <span className="text-sm font-medium text-stone-500">Subdomain</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {instituteSubdomain}.b2world.in
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
                        <span className="text-sm font-medium text-stone-500">Plan</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {institute?.plan || "STARTER"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
                        <span className="text-sm font-medium text-stone-500">Courses</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {courseCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
                        <span className="text-sm font-medium text-stone-500">Students</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {studentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}