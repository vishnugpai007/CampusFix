import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import LoginForm, { UserRole } from '../components/ui/LoginForm';

export const RoleLoginPage: React.FC = () => {
  const { role } = useParams<{ role?: string }>();

  let activeRole: UserRole = 'student';
  if (role === 'staff' || role === 'host' || role === 'student') {
    activeRole = role;
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-8">
        <Link to="/" className="inline-block hover:scale-105 transition-transform">
          <img src="/logo.png" alt="CampusFix Logo" className="h-16 w-auto mx-auto object-contain" />
        </Link>
        <p className="text-sm text-slate-600 max-w-sm mx-auto font-medium">
          Select your portal to manage, track, or resolve campus issues
        </p>
      </div>

      <LoginForm role={activeRole} />
    </div>
  );
};

export default RoleLoginPage;
