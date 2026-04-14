import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-neutral-200/80 bg-[#FAFAF7]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center text-base">
            🎓
          </div>
          <span className="font-display font-black text-xl text-neutral-900 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            B2World <span className="text-orange-500">LMS</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex gap-8 items-center">
          <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <a href="#pricing" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            Pricing
          </a>
          <Link href="/login" className="bg-neutral-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-700 transition-all flex items-center gap-1.5">
            Login →
          </Link>
        </nav>

      </div>
    </header>
  );
}