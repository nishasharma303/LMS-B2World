"use client";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <style>{`
       
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 8s ease-in-out infinite; }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-orange-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="auth-wrap relative z-10 w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/60 bg-white">
        <div className="hidden md:flex flex-col justify-between bg-neutral-900 text-white p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-base">
                🎓
              </div>
              <span className="font-display font-black text-lg tracking-tight">
                B2World <span className="text-orange-500">LMS</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                ⚡ Multi-Tenant LMS
              </span>
            </div>

            <h1 className="font-display font-black text-3xl lg:text-4xl leading-tight tracking-tight mb-4">
              Smart learning
              <br />
              platform for <span className="text-orange-500 ">every role.</span>
            </h1>

            <p className="text-neutral-400 text-sm leading-relaxed">
              Secure access, role-based dashboards, institute-specific onboarding and a modern
              SaaS-ready LMS experience.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-10">
            {[
              {
                icon: "🏫",
                role: "Institute Admin",
                desc: "Create institute portal, manage users, courses and analytics.",
                accent: "bg-orange-500/15 border-orange-500/20",
              },
              {
                icon: "👩‍🏫",
                role: "Teacher",
                desc: "Upload lectures, quizzes, assignments and track performance.",
                accent: "bg-blue-500/15 border-blue-500/20",
              },
              {
                icon: "🧑‍🎓",
                role: "Student",
                desc: "Access lessons, attempt quizzes and monitor learning progress.",
                accent: "bg-emerald-500/15 border-emerald-500/20",
              },
            ].map((r) => (
              <div
                key={r.role}
                className={`rounded-2xl border ${r.accent} px-4 py-3.5 flex items-start gap-3`}
              >
                <span className="text-xl mt-0.5">{r.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-white">{r.role}</p>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="float-a absolute bottom-32 right-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl px-3 py-2 flex items-center gap-2 z-20">
            <span className="text-lg">🏆</span>
            <div>
              <p className="font-bold text-[10px] text-white">10,000+ students</p>
              <p className="text-[9px] text-neutral-400">already learning</p>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-9 md:p-10 lg:p-12 flex items-center bg-[#FAFAF7]">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-7 md:hidden">
              <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center text-sm">
                🎓
              </div>
              <span className="font-display font-black text-lg text-neutral-900 tracking-tight">
                B2World <span className="text-orange-500">LMS</span>
              </span>
            </div>

            <h2 className="font-display font-black text-3xl text-neutral-900 tracking-tight mb-1">
              {title}
            </h2>
            <p className="text-neutral-400 text-sm mb-8">{subtitle}</p>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}