import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login/student" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their role's home view
    let target = '/';
    if (user.role === 'staff') target = '/staff/dashboard';
    else if (user.role === 'host') target = '/host/dashboard';
    return <Navigate to={target} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
