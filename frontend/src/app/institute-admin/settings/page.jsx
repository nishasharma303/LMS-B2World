"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/authStore";
import { getMyInstitute, updateInstitute } from "../../services/instituteService";

export default function InstituteSettingsPage() {
  const router = useRouter();
  const { token, user, institute, setInstitute, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "INSTITUTE_ADMIN") {
      router.push("/login");
      return;
    }

    fetchInstitute();
  }, [token, user]);

  const fetchInstitute = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyInstitute(token);
      const instituteData = response.data;

      setInstitute(instituteData);

      setFormData({
        name: instituteData?.name || "",
        subdomain: instituteData?.subdomain || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load institute settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "subdomain") {
      setFormData((prev) => ({
        ...prev,
        subdomain: value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!institute?.id) {
      setError("Institute not found.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await updateInstitute(
        institute.id,
        {
          name: formData.name.trim(),
          subdomain: formData.subdomain.trim(),
        },
        token
      );

      const updatedInstitute = {
        ...institute,
        ...response.data,
      };

      setInstitute(updatedInstitute);

      setFormData({
        name: updatedInstitute?.name || "",
        subdomain: updatedInstitute?.subdomain || "",
      });

      setMessage("Institute settings updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update institute settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const logoUrl = institute?.logoUrl?.trim();
  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#f59e0b";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1]">
        <div className="rounded-[28px] border border-stone-200 bg-white px-6 py-4 text-sm font-medium text-stone-600 shadow-sm">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#f8f6f1]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Institute Settings
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-900">
              Manage institute profile
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/institute-admin/branding")}
              className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Branding
            </button>
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

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-stone-200 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  Profile Settings
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-neutral-900">
                Basic institute details
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Update your institute name and subdomain. Branding changes can be managed separately.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Institute name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter institute name"
                  className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-stone-400 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Subdomain
                </label>
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="abc"
                  className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-stone-400 focus:bg-white"
                  required
                />
                <p className="mt-2 text-xs font-medium text-stone-500">
                  Portal URL: {formData.subdomain || "yourinstitute"}.b2world.in
                </p>
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
                type="submit"
                disabled={saving}
                className="rounded-full px-6 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-stone-200 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Institute Overview
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-900">
                    Current configuration
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/institute-admin/branding")}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-stone-400 hover:bg-stone-50"
                >
                  Edit Branding
                </button>
              </div>

              <div className="mt-7 grid gap-4">
                <div className="rounded-[24px] border border-stone-200 bg-[#fcfbf8] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                    Institute
                  </p>
                  <p className="mt-2 text-lg font-bold text-neutral-900">
                    {institute?.name || "Not set"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-stone-200 bg-[#fcfbf8] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                    Subdomain
                  </p>
                  <p className="mt-2 text-lg font-bold text-neutral-900">
                    {(institute?.subdomain || "yourinstitute")}.b2world.in
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-stone-200 bg-[#fcfbf8] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                      Plan
                    </p>
                    <p className="mt-2 text-lg font-bold text-neutral-900">
                      {institute?.plan || "STARTER"}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-[#fcfbf8] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                      Status
                    </p>
                    <p className="mt-2 text-lg font-bold text-neutral-900">
                      {institute?.status || "ACTIVE"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-stone-200 bg-[#fcfbf8] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                    Storage Limit
                  </p>
                  <p className="mt-2 text-lg font-bold text-neutral-900">
                    {institute?.storageLimitMb
                      ? `${institute.storageLimitMb} MB`
                      : "1024 MB"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-stone-200 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                Saved Branding
              </p>
              <div className="mt-5 flex items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Institute logo"
                    className="h-16 w-16 rounded-[22px] border border-stone-200 bg-white object-cover shadow-sm"
                  />
                ) : (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-[22px] text-xl font-bold text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {(institute?.name || "I").charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="text-lg font-bold text-neutral-900">
                    {institute?.name || "Your Institute"}
                  </p>
                  <p className="text-sm text-stone-500">
                    {(institute?.subdomain || "yourinstitute")}.b2world.in
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <div
                  className="flex-1 rounded-[22px] p-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="text-xs font-semibold text-white/80">Primary</p>
                  <p className="mt-3 text-sm font-bold text-white">{primaryColor}</p>
                </div>

                <div
                  className="flex-1 rounded-[22px] p-4"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <p className="text-xs font-semibold text-white/80">Accent</p>
                  <p className="mt-3 text-sm font-bold text-white">{secondaryColor}</p>
                </div>
              </div>

              <button
                onClick={() => router.push("/institute-admin/branding")}
                className="mt-6 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Open Branding Page
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}