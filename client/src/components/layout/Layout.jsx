import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900 dark:selection:bg-sky-500/30 dark:selection:text-sky-200 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children || <Outlet />}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CampusFix — Clean, reliable hostel issue tracking.</p>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Fast updates</span>
            <span>•</span>
            <span>Hostel operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
