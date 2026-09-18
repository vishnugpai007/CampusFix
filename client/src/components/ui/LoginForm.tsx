import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, User, ShieldCheck, Building2 } from 'lucide-react';
import { FlowButton } from './flow-button';

export type UserRole = 'student' | 'staff' | 'host';

interface LoginFormProps {
  role?: UserRole;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role = 'student' }) => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const roleMeta: Record<UserRole, { title: string; badge: string; icon: React.ElementType; color: string; path: string }> = {
    student: {
      title: 'Student Portal',
      badge: 'Report & Track Issues',
      icon: User,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      path: '/login/student'
    },
    staff: {
      title: 'Staff Portal',
      badge: 'Queue & Status Updates',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      path: '/login/staff'
    },
    host: {
      title: 'Host Portal',
      badge: 'Hostel Operations & Ragging Desk',
      icon: Building2,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      path: '/login/host'
    }
  };

  const currentMeta = roleMeta[role];
  const Icon = currentMeta.icon;

  const onSubmit = async (data: { email: string; password: string }) => {
    setGeneralError('');
    const result = await login(data.email, data.password, role);

    if (result.success) {
      toast.success(`Welcome to ${currentMeta.title}!`);

      // Determine redirect path by role
      const userRole = result.data?.role || role;
      let targetPath = '/';
      if (userRole === 'staff') targetPath = '/staff/dashboard';
      else if (userRole === 'host') targetPath = '/host/dashboard';

      const from = location.state?.from?.pathname;
      navigate(from || targetPath, { replace: true });
    } else {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        Object.entries(result.fieldErrors).forEach(([field, msg]) => {
          setError(field as any, { type: 'server', message: msg as string });
        });
      }
      setGeneralError(result.message || 'Login failed. Please verify your credentials.');
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Role Picker Tabs */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
        {(['student', 'staff', 'host'] as UserRole[]).map((r) => {
          const isActive = role === r;
          const meta = roleMeta[r];
          const TabIcon = meta.icon;

          return (
            <button
              key={r}
              type="button"
              onClick={() => navigate(meta.path)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : ''}`} />
              <span>{r}</span>
            </button>
          );
        })}
      </div>

      {/* Main Login Box */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        {/* Header inside Card */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`p-3.5 rounded-2xl border ${currentMeta.color} mb-3`}>
            <Icon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentMeta.title}</h2>
          <span className="mt-1 text-xs text-slate-500 font-medium">{currentMeta.badge}</span>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder={`${role}@campus.edu`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all ${
                  errors.email ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required'
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all ${
                  errors.password ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Hidden Role Identifier */}
          <input type="hidden" value={role} />

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </div>
        </form>

        {role === 'student' ? (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New student?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 italic">
              {role.charAt(0).toUpperCase() + role.slice(1)} accounts are managed by campus administration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
