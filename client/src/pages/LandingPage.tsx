import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, LogIn } from 'lucide-react';
import HeroSection from '../components/ui/HeroSection';
import ReportCategoriesGrid from '../components/ui/ReportCategoriesGrid';
import HowItWorksSteps from '../components/ui/HowItWorksSteps';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="CampusFix Logo"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Right Sign In Link */}
          <div className="flex items-center gap-3">
            <Link
              to="/login/student"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold transition-all"
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12">
        <HeroSection />
        <ReportCategoriesGrid />
        <HowItWorksSteps />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-500">
            CampusFix · Student-run campus maintenance reporting
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
