import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] overflow-x-hidden font-sans">

      {/* Google Fonts + minimal keyframe CSS */}
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
  body { font-family: 'Inter', sans-serif; }
  .font-display { font-family: 'Manrope', sans-serif; }
  .marquee { animation: marquee 24s linear infinite; }
  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .float-a { animation: floatA 6s ease-in-out infinite; }
  .float-b { animation: floatB 8s ease-in-out infinite; }
  .float-c { animation: floatC 7s ease-in-out infinite; }
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(1.5deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(-1.5deg)} }
  @keyframes floatC { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
  .card-lift { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease; }
  .card-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
  .squiggle {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='8'%3E%3Cpath d='M0 6 Q10 2 20 6 Q30 10 40 6 Q50 2 60 6 Q70 10 80 6' stroke='%23F97316' stroke-width='2.5' fill='none'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    background-position: 0 100%;
    background-size: 50px 8px;
    padding-bottom: 8px;
  }
`}</style>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-orange-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      {/* ─── HERO ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-10 md:pt-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm">⚡</span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500">Multi-Tenant LMS</span>
            </div>

            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-[4rem] leading-[1.06] tracking-tight text-neutral-900 mb-6">
              Launch your{" "}
              <span className="squiggle text-orange-500 ">own</span>
              {" "}branded<br className="hidden md:block" /> e-learning platform.
            </h1>

            <p className="text-neutral-500 text-lg leading-relaxed mb-10 max-w-md font-light">
              A scalable LMS SaaS for institutes, teachers &amp; students — role-based access,
              courses, live classes, quizzes &amp; analytics.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/login" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-700 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Get Started Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#pricing" className="inline-flex items-center border border-neutral-200 text-neutral-700 px-7 py-3.5 rounded-full font-semibold text-sm hover:border-neutral-400 hover:bg-stone-50 transition-all">
                View Pricing
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex -space-x-2.5">
                {['🧑‍💻','👩‍🏫','🧑‍🎓','👨‍💼'].map((e, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-base ${['bg-amber-100','bg-blue-100','bg-emerald-100','bg-pink-100'][i]}`}>
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="text-orange-400 text-sm">★</span>)}</div>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Trusted by 50+ institutes</p>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                <span className="text-neutral-900 font-bold text-sm">10,000+</span><br />students learning
              </p>
            </div>
          </div>

          {/* RIGHT — Dashboard mockup */}
          <div className="relative min-h-115">

            {/* Main card */}
            <div className="card-lift float-a bg-white rounded-3xl p-7 border border-neutral-100 shadow-2xl absolute top-8 left-2 right-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-lg">🎓</div>
                <div>
                  <p className="font-bold text-sm text-neutral-900">B2World Dashboard</p>
                  <p className="text-[11px] text-neutral-400">Institute Admin Panel</p>
                </div>
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">● LIVE</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { l: 'Students', v: '1,240', i: '🧑‍🎓', bg: 'bg-blue-50' },
                  { l: 'Courses',  v: '38',    i: '📚',   bg: 'bg-orange-50' },
                  { l: 'Revenue',  v: '₹2.4L', i: '💰',   bg: 'bg-emerald-50' },
                ].map(s => (
                  <div key={s.l} className={`${s.bg} rounded-2xl p-3 text-center`}>
                    <div className="text-2xl mb-1">{s.i}</div>
                    <div className="font-extrabold text-sm text-neutral-900">{s.v}</div>
                    <div className="text-[10px] text-neutral-400 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Course Completion</p>
              {[
                { name: 'React Bootcamp',  pct: 87, bar: 'bg-indigo-500' },
                { name: 'Data Science 101', pct: 64, bar: 'bg-orange-400' },
                { name: 'UI/UX Design',    pct: 52, bar: 'bg-emerald-500' },
              ].map(c => (
                <div key={c.name} className="mb-3 last:mb-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] text-neutral-500">{c.name}</span>
                    <span className="text-[11px] font-bold text-neutral-800">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Sticker — certificate */}
            <div className="float-b absolute -top-3 -right-3 md:-right-6 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg z-20">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-bold text-xs text-neutral-800">Certificate Issued!</p>
                <p className="text-[10px] text-neutral-400">Priya S. completed React</p>
              </div>
            </div>

            {/* Sticker — live */}
            <div className="float-c absolute -bottom-4 -right-3 md:-right-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg z-20">
              <span className="text-2xl">📹</span>
              <div>
                <p className="font-bold text-xs text-neutral-800">Live Class</p>
                <p className="text-[10px] text-neutral-400">12 students joined</p>
              </div>
            </div>

            {/* Sticker — AI */}
            <div className="float-a absolute -bottom-4 -left-3 md:-left-6 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg z-20">
              <span className="text-2xl">🧠</span>
              <div>
                <p className="font-bold text-xs text-neutral-800">AI Quiz Ready</p>
                <p className="text-[10px] text-neutral-400">Auto-generated ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="relative z-10 bg-neutral-900 py-3.5 overflow-hidden my-10">
        <div className="flex gap-10 marquee whitespace-nowrap">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex gap-10 shrink-0">
              {['🎓 Multi-Tenant Architecture','📚 Course Management','🎥 Live Classes','🏆 Auto Certificates','🧠 AI Quiz Generation','📊 Analytics Dashboard','💳 Payment Integration','🔐 Role-Based Access'].map(item => (
                <span key={item} className="text-white/80 text-xs font-medium flex items-center gap-3 shrink-0">
                  {item}<span className="text-white/20 text-lg">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500">🗺️ How It Works</span>
          </div>
          <h2 className="font-display font-black text-4xl md:text-5xl text-neutral-900 tracking-tight">
            From signup to launch in <span className="text-orange-500 ">3 steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: '🏫', title: 'Register Your Institute', desc: 'Sign up, set your branding — logo, colors, subdomain. Your LMS portal goes live instantly.', bg: 'bg-orange-50', border: 'border-orange-100', ghost: 'text-orange-100' },
            { step: '02', icon: '📚', title: 'Build Your Courses', desc: 'Add modules, upload videos & PDFs, create quizzes, and schedule live classes from one panel.', bg: 'bg-blue-50', border: 'border-blue-100', ghost: 'text-blue-100' },
            { step: '03', icon: '🚀', title: 'Enroll & Track', desc: 'Invite students, track progress, issue certificates, and monitor revenue in real time.', bg: 'bg-emerald-50', border: 'border-emerald-100', ghost: 'text-emerald-100' },
          ].map((s, i) => (
            <div key={i} className={`card-lift ${s.bg} border ${s.border} rounded-3xl p-8 relative overflow-hidden`}>
              <div className={`font-display font-black text-9xl ${s.ghost} absolute -top-3 -right-2 leading-none select-none pointer-events-none`}>{s.step}</div>
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="font-bold text-lg text-neutral-900 mb-3">{s.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative z-10 bg-stone-100/70 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 mb-5">
              <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500">✨ Platform Features</span>
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-neutral-900 tracking-tight">
              Everything your institute <span className="">needs</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🏷️', iconBg: 'bg-orange-100', bg: 'bg-orange-50',  title: 'White-Label Branding', desc: 'Custom logo, colors & subdomain. Your brand, your platform.' },
              { icon: '🎥', iconBg: 'bg-blue-100',   bg: 'bg-blue-50',    title: 'Live Classes',         desc: 'Zoom/WebRTC integration with attendance tracking & recording.' },
              { icon: '🧠', iconBg: 'bg-violet-100', bg: 'bg-violet-50',  title: 'AI Quiz Generation',  desc: 'Auto-generate MCQ quizzes from your lecture content.' },
              { icon: '📊', iconBg: 'bg-emerald-100',bg: 'bg-emerald-50', title: 'Analytics Dashboard', desc: 'Real-time insights on enrollment, revenue, and engagement.' },
              { icon: '🏆', iconBg: 'bg-yellow-100', bg: 'bg-yellow-50',  title: 'Auto Certificates',   desc: 'QR-verified certificates auto-issued on course completion.' },
              { icon: '💳', iconBg: 'bg-rose-100',   bg: 'bg-rose-50',    title: 'Payment Gateway',     desc: 'Razorpay/Stripe with invoices, coupons & plan management.' },
              { icon: '🔐', iconBg: 'bg-indigo-100', bg: 'bg-indigo-50',  title: 'Role-Based Access',   desc: 'Super Admin, Institute Admin, Teacher, Student — isolated.' },
              { icon: '📱', iconBg: 'bg-teal-100',   bg: 'bg-teal-50',    title: 'Mobile PWA',          desc: 'Works offline, installable, and fully responsive on all devices.' },
            ].map((f, i) => (
              <div key={i} className={`card-lift ${f.bg} rounded-2xl p-6 border border-white/80`}>
                <div className={`w-12 h-12 ${f.iconBg} rounded-2xl flex items-center justify-center text-2xl mb-4`}>{f.icon}</div>
                <h3 className="font-bold text-sm text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLES ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500">👥 Role-Based Access</span>
          </div>
          <h2 className="font-display font-black text-4xl md:text-5xl text-neutral-900 tracking-tight">
            Built for <span className="text-indigo-500 ">everyone</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: '👑', role: 'Super Admin', tag: 'B2World', dark: true,
              perks: ['Manage all institutes','Set subscription plans','Global analytics','Revenue monitoring'] },
            { icon: '🏫', role: 'Institute Admin', tag: 'You',
              bg: 'bg-orange-50', border: 'border-orange-100', tagStyle: 'bg-orange-100 text-orange-600',
              perks: ['Create courses & quizzes','Add teachers & students','Custom branding','Issue certificates'] },
            { icon: '👩‍🏫', role: 'Teacher', tag: 'Educator',
              bg: 'bg-blue-50', border: 'border-blue-100', tagStyle: 'bg-blue-100 text-blue-600',
              perks: ['Upload lectures & PDFs','Create assignments','Grade submissions','Track performance'] },
            { icon: '🧑‍🎓', role: 'Student', tag: 'Learner',
              bg: 'bg-emerald-50', border: 'border-emerald-100', tagStyle: 'bg-emerald-100 text-emerald-600',
              perks: ['Enroll in courses','Watch & join live classes','Attempt quizzes','Download certificates'] },
          ].map((r, i) => (
            <div key={i} className={`card-lift rounded-3xl p-7 ${r.dark ? 'bg-neutral-900 border border-neutral-800' : `${r.bg} border ${r.border}`}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <p className={`font-bold text-sm ${r.dark ? 'text-white' : 'text-neutral-900'}`}>{r.role}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.dark ? 'bg-white/10 text-white/50' : r.tagStyle}`}>{r.tag}</span>
                </div>
              </div>
              <ul className="space-y-3">
                {r.perks.map(p => (
                  <li key={p} className={`flex items-center gap-2.5 text-xs ${r.dark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${r.dark ? 'bg-white/10 text-white/50' : 'bg-black/5 text-neutral-400'}`}>✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="relative z-10 bg-stone-100/70 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 mb-5">
              <span className="text-[11px] font-bold tracking-widest uppercase text-stone-500">💳 Pricing Plans</span>
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-neutral-900 tracking-tight">
              Simple, <span className="text-emerald-500 ">transparent</span> pricing
            </h2>
            <p className="text-neutral-400 mt-3 text-sm">Start free, scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {[
              {
                name: 'Starter', emoji: '🌱', price: 'free', period: '/mo',
                tagline: 'Perfect to get started',
                features: ['100 students','5 GB storage','Basic analytics','Course management','Email support'],
                popular: false, cta: 'Start Free Trial',
                wrap: 'bg-white border border-neutral-200',
                ctaClass: 'bg-neutral-900 text-white hover:bg-neutral-700',
                textDark: true,
              },
              {
                name: 'Professional', emoji: '⚡', price: '₹2999', period: '/mo',
                tagline: 'Most popular for institutes',
                features: ['1,000 students','50 GB storage','Live classes','Custom branding','Advanced analytics','Priority support'],
                popular: true, cta: 'Get Started',
                wrap: 'bg-neutral-900 border border-neutral-700 md:scale-105',
                ctaClass: 'bg-white text-neutral-900 hover:bg-neutral-100',
                textDark: false,
              },
              {
                name: 'Enterprise', emoji: '🏢', price: '7999', period: '/mo',
                tagline: 'For large institutions',
                features: ['Unlimited students','Unlimited storage','Custom domain','AI features','Dedicated manager','SLA guarantee'],
                popular: false, cta: 'Contact Sales',
                wrap: 'bg-white border border-neutral-200',
                ctaClass: 'bg-neutral-900 text-white hover:bg-neutral-700',
                textDark: true,
              },
            ].map((plan) => (
              <div key={plan.name} className={`card-lift ${plan.wrap} rounded-3xl p-8 flex flex-col relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                    ⚡ MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <span className="text-3xl">{plan.emoji}</span>
                  <h3 className={`font-bold text-xl mt-3 mb-1 ${plan.textDark ? 'text-neutral-900' : 'text-white'}`}>{plan.name}</h3>
                  <p className="text-xs text-neutral-400">{plan.tagline}</p>
                </div>

                <div className="mb-7">
                  <span className={`font-display font-black text-5xl ${plan.textDark ? 'text-neutral-900' : 'text-white'}`}>{plan.price}</span>
                  <span className="text-sm text-neutral-400 ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 grow">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.textDark ? 'text-neutral-500' : 'text-neutral-300'}`}>
                      <span className="text-emerald-400 font-bold text-base leading-none">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/login" className={`block text-center py-3.5 rounded-full font-bold text-sm transition-all ${plan.ctaClass}`}>
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="bg-neutral-900 rounded-4xl px-10 py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

          <div className="relative z-10">
            <div className="text-5xl mb-5">🚀</div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight mb-4">
              Ready to launch your<br />
              <span className="text-orange-500 ">LMS today?</span>
            </h2>
            <p className="text-neutral-400 text-sm max-w-sm mx-auto mb-10">
              Join 50+ institutes already on B2World LMS. Setup takes less than 10 minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Start Free →
              </Link>
              <a href="#pricing" className="bg-white/10 hover:bg-white/15 border border-white/10 text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all">
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-neutral-200 bg-[#FAFAF7] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
          <div>
            <p className="font-display font-black text-xl text-neutral-900">B2World <span className="text-orange-500">LMS</span></p>
            <p className="text-xs text-neutral-400 mt-1">White-Label E-Learning SaaS Platform</p>
          </div>
          <nav className="flex gap-8 flex-wrap">
            <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-700 font-medium transition-colors">Home</Link>
            <a href="#pricing" className="text-sm text-neutral-400 hover:text-neutral-700 font-medium transition-colors">Pricing</a>
            <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-700 font-medium transition-colors">Login</Link>
          </nav>
          <p className="text-xs text-neutral-300">© 2025 B2World. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}