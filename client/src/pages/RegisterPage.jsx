import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Wrench, Loader2, User, Mail, Lock, Building, ArrowRight } from 'lucide-react';
import { FlowButton } from '../components/ui/flow-button';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      hostelBlock: ''
    }
  });

  const [generalError, setGeneralError] = useState('');

  const onSubmit = async (data) => {
    setGeneralError('');
    const result = await registerUser(data);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        Object.entries(result.fieldErrors).forEach(([field, msg]) => {
          setError(field, { type: 'server', message: msg });
        });
      }
      setGeneralError(result.message || 'Registration failed. Please check your details.');
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src="/logo.png" alt="CampusFix Logo" className="h-16 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Student Account
          </h1>
          <p className="text-sm text-slate-600">
            Join CampusFix to report issues and track resolutions
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all ${
                    errors.name ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="student@campus.edu"
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
                  placeholder="At least 8 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
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

            {/* Hostel Block / Building (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Hostel / Residence Block <span className="text-slate-400">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Block B, Room 304"
                  {...register('hostelBlock')}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login/student" className="font-semibold text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
