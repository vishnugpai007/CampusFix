import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mb-6 shadow-lg shadow-sky-500/5">
        <Compass className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 mb-2">404</h1>
      <h2 className="text-lg sm:text-xl font-semibold text-slate-300 mb-3">Page Not Found</h2>

      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        The page you are looking for might have been moved, renamed, or does not exist.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-sky-500/10 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
