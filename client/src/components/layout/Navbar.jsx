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
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
    }`;

  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:scale-105 transition-all">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100">
            Campus<span className="text-sky-400">Fix</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1.5">
            <Link to="/" className={navLinkClass('/')}>
              <span>Issues</span>
            </Link>
            <Link to="/issues/new" className={navLinkClass('/issues/new')}>
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>
            <Link to="/my-reports" className={navLinkClass('/my-reports')}>
              <FolderOpen className="w-4 h-4" />
              <span>My Reports</span>
            </Link>
            {isStaffOrAdmin && (
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>
        ) : null}

        {/* User Actions / Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-sky-400">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-200 line-clamp-1">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                    {isStaffOrAdmin && <ShieldCheck className="w-3 h-3 text-sky-400" />}
                    {user?.role} {user?.hostelBlock ? `• ${user.hostelBlock}` : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <FlowButton text="Sign In" className="px-5 py-1.5 text-xs border-slate-800 text-slate-300" />
              </Link>
              <Link to="/register">
                <FlowButton text="Register" className="px-5 py-1.5 text-xs" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
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
