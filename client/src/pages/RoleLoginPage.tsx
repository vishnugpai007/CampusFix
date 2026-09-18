import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import LoginForm, { UserRole } from '../components/ui/LoginForm';

import ThemeToggle from '../components/ui/ThemeToggle';

export const RoleLoginPage: React.FC = () => {
  const { role } = useParams<{ role?: string }>();

  let activeRole: UserRole = 'student';
  if (role === 'staff' || role === 'host' || role === 'student') {
    activeRole = role;
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="text-center space-y-3 mb-8">
        <Link to="/" className="inline-flex items-center gap-3 group hover:scale-105 transition-transform">
          <img src="/logo.png" alt="CampusFix Logo" className="h-12 w-auto object-contain" />
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            Campus<span className="text-blue-600 dark:text-sky-400">Fix</span>
          </span>
        </Link>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-medium">
          Select your portal to manage, track, or resolve campus issues
        </p>
      </div>

      <LoginForm role={activeRole} />
    </div>
  );
};

export default RoleLoginPage;
