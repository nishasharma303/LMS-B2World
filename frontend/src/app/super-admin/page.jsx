"use client";

import { useEffect, useState } from "react";
import {
  createInstitute,
  getInstitutes,
  getAnalytics,
} from "@/app/services/superAdminService";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [institutes, setInstitutes] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    plan: "STARTER",
  });

  const load = async () => {
    const res = await getInstitutes();
    const s = await getAnalytics();
    setInstitutes(res.data);
    setStats(s.data);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await createInstitute(form);
    setForm({ name: "", subdomain: "", adminName: "", adminEmail: "", adminPassword: "", plan: "STARTER" });
    setShowForm(false);
    load();
  };

  const planMeta = {
    STARTER: {
      label: "Starter", emoji: "🌱",
      badge: "bg-emerald-100 text-emerald-700",
      topBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      cardBorder: "border-emerald-100",
      btnFrom: "#10b981", btnTo: "#14b8a6",
      btnHover: "hover:opacity-90",
    },
    PROFESSIONAL: {
      label: "Professional", emoji: "⚡",
      badge: "bg-orange-100 text-orange-600",
      topBg: "bg-gradient-to-br from-orange-50 to-amber-50",
      cardBorder: "border-orange-100",
      btnFrom: "#f97316", btnTo: "#f59e0b",
      btnHover: "hover:opacity-90",
    },
    ENTERPRISE: {
      label: "Enterprise", emoji: "🏢",
      badge: "bg-indigo-100 text-indigo-600",
      topBg: "bg-gradient-to-br from-indigo-50 to-violet-50",
      cardBorder: "border-indigo-100",
      btnFrom: "#6366f1", btnTo: "#8b5cf6",
      btnHover: "hover:opacity-90",
    },
  };

  const statusMeta = {
    ACTIVE:    { dot: "bg-emerald-400", label: "Active",    style: "text-emerald-600" },
    SUSPENDED: { dot: "bg-rose-400",    label: "Suspended", style: "text-rose-500" },
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans overflow-x-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Manrope', sans-serif; }
        .card-lift { transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease; }
        .card-lift:hover { transform: translateY(-5px); box-shadow: 0 20px 44px rgba(0,0,0,0.09); }
        .stat-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        .input-field {
          border: 1.5px solid #e5e5e5; border-radius: 12px;
          padding: 11px 14px; font-size: 13px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fafaf7; width: 100%; color: #171717;
        }
        .input-field::placeholder { color: #a3a3a3; }
        .input-field:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
        .form-slide { animation: slideDown 0.3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        .manage-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 10px 0; border-radius: 999px;
          font-weight: 700; font-size: 13px; letter-spacing: 0.01em;
          color: white; border: none; cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .manage-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,0.22); opacity: 0.92; }
        .manage-btn:active { transform: translateY(0); }
      `}</style>

      {/* ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-emerald-100 rounded-full opacity-25 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-4 py-1.5 mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-500">👑 Super Admin</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-neutral-900 tracking-tight leading-tight">
              Platform Control
            </h1>
            <p className="text-neutral-400 text-sm mt-1.5">Manage all institutes, plans &amp; analytics</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="text-base leading-none">+</span> New Institute
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 border border-neutral-200 text-neutral-600 bg-white hover:bg-stone-50 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* STATS */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Institutes", value: stats.totalInstitutes, icon: "🏫", bg: "bg-orange-50",  border: "border-orange-100",  iconBg: "bg-orange-100" },
              { label: "Users",      value: stats.totalUsers,      icon: "👥", bg: "bg-blue-50",    border: "border-blue-100",    iconBg: "bg-blue-100" },
              { label: "Courses",    value: stats.totalCourses,    icon: "📚", bg: "bg-violet-50",  border: "border-violet-100",  iconBg: "bg-violet-100" },
              { label: "Revenue",    value: `₹${stats.revenue}`,   icon: "💰", bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-100" },
            ].map((s) => (
              <div key={s.label} className={`stat-card ${s.bg} border ${s.border} p-5 rounded-3xl`}>
                <div className={`w-10 h-10 ${s.iconBg} rounded-2xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{s.label}</p>
                <h2 className="font-display font-black text-3xl text-neutral-900 mt-1">{s.value}</h2>
              </div>
            ))}
          </div>
        )}

        {/* CREATE FORM */}
        {showForm && (
          <div className="form-slide bg-white border border-neutral-100 rounded-3xl p-8 shadow-xl mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-neutral-900">Create New Institute</h2>
                <p className="text-neutral-400 text-xs mt-0.5">Fill in the details to onboard a new institute</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-stone-100 text-neutral-400 hover:bg-stone-200 flex items-center justify-center text-sm transition-colors">✕</button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                ["Institute Name", "name",         "text"],
                ["Subdomain",      "subdomain",     "text"],
                ["Admin Name",     "adminName",     "text"],
                ["Admin Email",    "adminEmail",    "email"],
                ["Password",       "adminPassword", "password"],
              ].map(([placeholder, key, type]) => (
                <input
                  key={key}
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  className="input-field"
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ))}

              <select
                className="input-field cursor-pointer"
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
              >
                <option value="STARTER">🌱 Starter</option>
                <option value="PROFESSIONAL">⚡ Professional</option>
                <option value="ENTERPRISE">🏢 Enterprise</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-full font-bold text-sm transition-all hover:shadow-lg">
                Create Institute →
              </button>
              <button onClick={() => setShowForm(false)} className="inline-flex items-center gap-2 border border-neutral-200 text-neutral-500 px-6 py-3 rounded-full font-semibold text-sm hover:bg-stone-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* LIST HEADER */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-2xl text-neutral-900">
            All Institutes
            <span className="ml-2.5 text-sm font-semibold bg-stone-100 text-neutral-400 px-2.5 py-0.5 rounded-full">{institutes.length}</span>
          </h2>
        </div>

        {institutes.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-200 rounded-3xl p-16 text-center">
            <div className="text-5xl mb-4">🏫</div>
            <p className="font-bold text-neutral-700 mb-1">No institutes yet</p>
            <p className="text-sm text-neutral-400">Click "New Institute" to onboard your first one.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {institutes.map((i) => {
              const plan   = planMeta[i.plan]     ?? { label: i.plan, emoji: "📋", badge: "bg-stone-100 text-stone-500", topBg: "bg-stone-50", cardBorder: "border-stone-100", btnFrom: "#737373", btnTo: "#525252" };
              const status = statusMeta[i.status] ?? { dot: "bg-stone-400", label: i.status, style: "text-stone-500" };

              return (
                <div key={i.id} className={`card-lift bg-white border ${plan.cardBorder} rounded-3xl overflow-hidden flex flex-col`}>

                  {/* coloured top band */}
                  <div className={`${plan.topBg} px-6 pt-5 pb-4 flex items-start justify-between`}>
                    <div className="w-11 h-11 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-2xl">
                      {plan.emoji}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${plan.badge}`}>
                      {plan.label}
                    </span>
                  </div>

                  {/* body */}
                  <div className="px-6 py-5 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-neutral-900 mb-0.5">{i.name}</h3>
                    <p className="text-xs text-neutral-400 font-medium mb-3">{i.subdomain}.b2world.in</p>

                    <div className="flex items-center gap-1.5 mb-5">
                      <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className={`text-xs font-semibold ${status.style}`}>{status.label}</span>
                    </div>

                    {/* gradient manage button */}
                    <button
                      className="manage-btn mt-auto"
                      style={{ background: `linear-gradient(135deg, ${plan.btnFrom}, ${plan.btnTo})` }}
                      onClick={() => router.push(`/super-admin/institutes/${i.id}`)}
                    >
                      Manage
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}