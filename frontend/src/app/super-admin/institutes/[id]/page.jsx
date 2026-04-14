"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getInstitute,
  updateInstitute,
} from "@/app/services/superAdminService";

// Storage limits per plan in MB
const PLAN_STORAGE = {
  STARTER:      5 * 1024,        // 5 GB  = 5120 MB
  PROFESSIONAL: 50 * 1024,       // 50 GB = 51200 MB
  ENTERPRISE:   500 * 1024,      // 500 GB (effectively unlimited display)
};

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [inst, setInst] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const res = await getInstitute(id);
    setInst(res.data);
    setForm(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateInstitute(id, {
        plan: form.plan,
        status: form.status,
        storageLimitMb: Number(form.storageLimitMb),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      load();
    } catch {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🏫</div>
        <p className="text-neutral-400 text-sm font-medium">Loading institute…</p>
      </div>
    </div>
  );

  const planMeta = {
    STARTER: {
      emoji: "🌱", label: "Starter",
      desc: "Up to 100 students · 5 GB storage",
      storageGb: 5,
      selectedBorder: "border-emerald-400",
      selectedBg: "bg-emerald-50",
      selectedLabel: "text-emerald-700",
      barColor: "#10b981",
    },
    PROFESSIONAL: {
      emoji: "⚡", label: "Professional",
      desc: "Up to 1,000 students · 50 GB storage",
      storageGb: 50,
      selectedBorder: "border-orange-400",
      selectedBg: "bg-orange-50",
      selectedLabel: "text-orange-600",
      barColor: "#f97316",
    },
    ENTERPRISE: {
      emoji: "🏢", label: "Enterprise",
      desc: "Unlimited students · 500 GB storage",
      storageGb: 500,
      selectedBorder: "border-indigo-400",
      selectedBg: "bg-indigo-50",
      selectedLabel: "text-indigo-600",
      barColor: "#6366f1",
    },
  };

  const currentPlan    = planMeta[form.plan] ?? planMeta.STARTER;
  const allocatedMb    = PLAN_STORAGE[form.plan] ?? PLAN_STORAGE.STARTER;
  const usedMb         = form.usedStorageMb ?? 0;
  const storagePct     = Math.min(100, Math.round((usedMb / allocatedMb) * 100));
  const usedGb         = (usedMb / 1024).toFixed(2);
  const allocatedGb    = currentPlan.storageGb;

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Manrope', sans-serif; }
        .input-field {
          border: 1.5px solid #e5e5e5; border-radius: 12px;
          padding: 11px 14px; font-size: 13px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fafaf7; width: 100%;
          color: #171717; font-weight: 500;
        }
        .input-field::placeholder { color: #a3a3a3; font-weight: 400; }
        .input-field:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
        .badge-in { animation: badgeIn 0.4s cubic-bezier(.34,1.56,.64,1); }
        @keyframes badgeIn { from { opacity:0; transform:scale(0.7) } to { opacity:1; transform:scale(1) } }
        .plan-card {
          cursor: pointer; border: 2px solid #e5e5e5; border-radius: 16px;
          padding: 14px 16px; transition: border-color 0.2s, background 0.2s;
          background: #fff;
        }
        .plan-card:hover:not(.selected-plan) { border-color: #d4d4d4; background: #fafaf7; }
        .plan-card p, .plan-card span { color: #404040; }
        .plan-card .plan-desc { color: #737373; font-size: 11px; margin-top: 3px; line-height: 1.5; }
        .status-card {
          cursor: pointer; border: 2px solid #e5e5e5; border-radius: 16px;
          padding: 14px 16px; transition: border-color 0.2s, background 0.2s;
          background: #fff;
        }
        .status-card:hover:not(.selected-status) { border-color: #d4d4d4; background: #fafaf7; }
        .status-card p { color: #404040; }
        .status-card .status-desc { color: #737373; font-size: 11px; margin-top: 3px; }
        .storage-bar-fill { transition: width 0.7s cubic-bezier(.4,0,.2,1); }
        .section-card { transition: box-shadow 0.25s ease; }
        .section-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
      `}</style>

      {/* ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 border border-neutral-200 text-neutral-600 bg-white hover:bg-stone-50 px-5 py-2 rounded-full font-semibold text-sm transition-all mb-8"
        >
          ← Back to Dashboard
        </button>

        {/* HEADER CARD */}
        <div className="bg-neutral-900 rounded-3xl px-8 py-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">{currentPlan.emoji}</div>
              <div>
                <h1 className="font-display font-black text-3xl text-white tracking-tight">{form.name}</h1>
                <p className="text-neutral-400 text-sm mt-0.5">{form.subdomain}.b2world.in</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
              form.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${form.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"}`} />
              {form.status}
            </span>
          </div>
        </div>

        {/* STORAGE SNAPSHOT — reflects current plan */}
        <div className="bg-white border border-neutral-100 rounded-3xl px-7 py-6 mb-6 section-card">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm text-neutral-800">Storage Usage</span>
            <span className="text-xs font-bold text-neutral-500">
              {usedGb} GB / {allocatedGb} GB
              <span className="text-neutral-300 mx-1.5">·</span>
              <span className={storagePct > 85 ? "text-rose-500" : storagePct > 60 ? "text-orange-500" : "text-emerald-600"}>
                {storagePct}% used
              </span>
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mb-3">Based on <strong className="text-neutral-600">{currentPlan.label}</strong> plan · {allocatedGb} GB allocated</p>

          {/* track */}
          <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="storage-bar-fill h-full rounded-full"
              style={{
                width: `${storagePct}%`,
                background: storagePct > 85
                  ? "linear-gradient(90deg,#f97316,#ef4444)"
                  : storagePct > 60
                  ? "linear-gradient(90deg,#f59e0b,#f97316)"
                  : `linear-gradient(90deg,${currentPlan.barColor}cc,${currentPlan.barColor})`,
              }}
            />
          </div>

          {/* legend dots */}
          <div className="flex gap-4 mt-3">
            {[
              { pct: "0–60%",   color: "#10b981", label: "Healthy" },
              { pct: "60–85%",  color: "#f97316", label: "Moderate" },
              { pct: "85–100%", color: "#ef4444", label: "Critical" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] text-neutral-400">{l.label} <span className="text-neutral-300">({l.pct})</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT PANEL */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-8 section-card">
          <h2 className="font-display font-bold text-xl text-neutral-900 mb-7">Edit Settings</h2>

          {/* PLAN */}
          <div className="mb-7">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Subscription Plan</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(planMeta).map(([key, meta]) => {
                const isSelected = form.plan === key;
                return (
                  <div
                    key={key}
                    className={`plan-card ${isSelected ? "selected-plan" : ""}`}
                    style={isSelected ? { borderColor: meta.barColor, background: meta.selectedBg } : {}}
                    onClick={() => setForm({ ...form, plan: key })}
                  >
                    <div className="text-xl mb-1">{meta.emoji}</div>
                    <p className="font-bold text-sm" style={isSelected ? { color: meta.barColor } : {}}>{meta.label}</p>
                    <p className="plan-desc">{meta.desc}</p>
                  </div>
                );
              })}
            </div>
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="sr-only">
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="mb-7">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Account Status</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "ACTIVE",    emoji: "✅", label: "Active",    desc: "Institute can log in & operate normally.", selBorder: "#10b981", selBg: "#f0fdf4", selColor: "#065f46" },
                { val: "SUSPENDED", emoji: "🚫", label: "Suspended", desc: "Access blocked. Data preserved.",           selBorder: "#ef4444", selBg: "#fff1f2", selColor: "#9f1239" },
              ].map((s) => {
                const isSelected = form.status === s.val;
                return (
                  <div
                    key={s.val}
                    className={`status-card ${isSelected ? "selected-status" : ""}`}
                    style={isSelected ? { borderColor: s.selBorder, background: s.selBg } : {}}
                    onClick={() => setForm({ ...form, status: s.val })}
                  >
                    <div className="text-lg mb-1">{s.emoji}</div>
                    <p className="font-bold text-sm" style={isSelected ? { color: s.selColor } : {}}>{s.label}</p>
                    <p className="status-desc">{s.desc}</p>
                  </div>
                );
              })}
            </div>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="sr-only">
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* STORAGE LIMIT INPUT — no emoji icon, clean */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Storage Limit (MB)</label>
            <p className="text-[11px] text-neutral-400 mb-3">
              Recommended: Starter = 5120 MB (5 GB) &nbsp;·&nbsp; Pro = 51200 MB (50 GB) &nbsp;·&nbsp; Enterprise = 512000 MB (500 GB)
            </p>
            <input
              type="number"
              value={form.storageLimitMb}
              onChange={(e) => setForm({ ...form, storageLimitMb: e.target.value })}
              className="input-field max-w-xs"
              placeholder="e.g. 5120"
            />
          </div>

          {/* SAVE */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all ${
                saving ? "bg-neutral-200 text-neutral-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white hover:-translate-y-0.5 hover:shadow-lg"
              }`}
            >
              {saving ? "Saving…" : "Save Changes →"}
            </button>

            {saved && (
              <span className="badge-in inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                ✓ Saved successfully!
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}