import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, User, ShieldCheck, Building2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 md:p-16 my-6 shadow-xl shadow-slate-200/50">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`relative z-10 max-w-3xl mx-auto text-center transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
          <Wrench className="w-3.5 h-3.5 text-blue-600" />
          <span>Campus Maintenance Portal</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight sm:leading-tight tracking-tight mb-6">
          Report it once.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
            Track it until it is fixed.
          </span>
        </h1>

        {/* One-line Subtext */}
        <p className="text-slate-600 text-base sm:text-lg md:text-xl font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
          Students log hostel & college infra problems with photo + location, follow live status, and upvote priority issues.
        </p>

        {/* Three Role Login CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
          <Link
            to="/login/student"
            className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <User className="w-4 h-4" />
            <span>Student Login</span>
          </Link>

          <Link
            to="/login/staff"
            className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Staff Login</span>
          </Link>

          <Link
            to="/login/host"
            className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Host Login</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
