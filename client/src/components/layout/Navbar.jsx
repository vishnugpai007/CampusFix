import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Wrench,
  PlusCircle,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck
} from 'lucide-react';
import { FlowButton } from '../ui/flow-button';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
      isActive(path)
        ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
    }`;

  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="CampusFix Logo"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1.5">
            <Link to="/" className={navLinkClass('/')}>
              <span>Issues</span>
            </Link>
            <Link to="/issues/new" className={navLinkClass('/issues/new')}>
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Report Issue</span>
            </Link>
            <Link to="/my-reports" className={navLinkClass('/my-reports')}>
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>My Reports</span>
            </Link>
            {user?.role === 'staff' && (
              <Link to="/staff/dashboard" className={navLinkClass('/staff/dashboard')}>
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Staff Ops</span>
              </Link>
            )}
            {user?.role === 'host' && (
              <Link to="/host/dashboard" className={navLinkClass('/host/dashboard')}>
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span>Host Ops</span>
              </Link>
            )}
          </nav>
        ) : null}

        {/* User Actions / Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 line-clamp-1">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                    {user?.role === 'staff' || user?.role === 'host' ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : null}
                    {user?.role} {user?.hostelBlock ? `• ${user.hostelBlock}` : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login/student"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2">
          <div className="px-3 py-2 mb-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-semibold text-sky-400">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200">{user?.name}</span>
              <span className="text-xs text-slate-400 capitalize">{user?.email}</span>
            </div>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass('/')}
          >
            <span>Issues</span>
          </Link>
          <Link
            to="/issues/new"
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass('/issues/new')}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </Link>
          <Link
            to="/my-reports"
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass('/my-reports')}
          >
            <FolderOpen className="w-4 h-4" />
            <span>My Reports</span>
          </Link>
          {isStaffOrAdmin && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
