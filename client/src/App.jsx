import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routes/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import RoleLoginPage from './pages/RoleLoginPage';
import RegisterPage from './pages/RegisterPage';
import IssueFeedPage from './pages/IssueFeedPage';
import CreateIssuePage from './pages/CreateIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import MyReportsPage from './pages/MyReportsPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import HostDashboardPage from './pages/HostDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Public Only Guard (redirects away from login/register if already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// Smart Home Route Handler
const HomeRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <LandingPage />;
  if (user?.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
  if (user?.role === 'host') return <Navigate to="/host/dashboard" replace />;
  return <IssueFeedPage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Home Route */}
      <Route
        path="/"
        element={
          <Layout>
            <HomeRoute />
          </Layout>
        }
      />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <RoleLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login/:role"
        element={
          <PublicOnlyRoute>
            <RoleLoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Routes inside App Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/issues/new" element={<CreateIssuePage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />

        {/* Staff Only / Shared Route */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff', 'host']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Host Only Confidential Route */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy /dashboard alias */}
        <Route path="/dashboard" element={<HomeRoute />} />

        {/* 404 Page inside layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
