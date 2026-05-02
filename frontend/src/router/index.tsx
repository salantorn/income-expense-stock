import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useMe } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

// Lazy loaded pages
const LoginPage = React.lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('../pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TransactionsPage = React.lazy(() => import('../pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const PortfolioPage = React.lazy(() => import('../pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const AnalyticsPage = React.lazy(() => import('../pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading fallback component
const PageFallback = () => (
  <div className="p-6 space-y-4 w-full">
    <SkeletonLoader width="40%" height="2rem" />
    <SkeletonLoader width="100%" height="8rem" />
    <SkeletonLoader width="100%" height="12rem" />
  </div>
);

// Protected route wrapper
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const { isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <PageFallback />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Redirect to dashboard if already logged in
function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <React.Suspense fallback={<PageFallback />}>
          <RedirectIfAuth><LoginPage /></RedirectIfAuth>
        </React.Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/register',
    element: (
      <ErrorBoundary>
        <React.Suspense fallback={<PageFallback />}>
          <RedirectIfAuth><RegisterPage /></RedirectIfAuth>
        </React.Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <ErrorBoundary>
        <React.Suspense fallback={<PageFallback />}>
          <ForgotPasswordPage />
        </React.Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { 
        path: 'dashboard', 
        element: <React.Suspense fallback={<PageFallback />}><DashboardPage /></React.Suspense> 
      },
      { 
        path: 'transactions', 
        element: <React.Suspense fallback={<PageFallback />}><TransactionsPage /></React.Suspense> 
      },
      { 
        path: 'portfolio', 
        element: <React.Suspense fallback={<PageFallback />}><PortfolioPage /></React.Suspense> 
      },
      { 
        path: 'analytics', 
        element: <React.Suspense fallback={<PageFallback />}><AnalyticsPage /></React.Suspense> 
      },
      { 
        path: 'settings', 
        element: <React.Suspense fallback={<PageFallback />}><SettingsPage /></React.Suspense> 
      },
    ],
  },
  {
    path: '*',
    element: (
      <React.Suspense fallback={<PageFallback />}>
        <NotFoundPage />
      </React.Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
