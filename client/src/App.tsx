import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Keep critical registration page eager for instant first load
import { RegisterPage } from './pages/RegisterPage';

// Lazy-load non-critical and heavy administrative chunks (recharts, html5-qrcode, etc.)
const RegistrationSuccessPage = lazy(() =>
  import('./pages/RegistrationSuccessPage').then((m) => ({ default: m.RegistrationSuccessPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ScannerPage = lazy(() =>
  import('./pages/ScannerPage').then((m) => ({ default: m.ScannerPage }))
);
const RegistrationsPage = lazy(() =>
  import('./pages/RegistrationsPage').then((m) => ({ default: m.RegistrationsPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-7 h-7 border-3 border-[#E31827] border-t-transparent rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Alumni Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Navigate to="/register" replace />
                </PublicLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PublicLayout>
                  <RegisterPage />
                </PublicLayout>
              }
            />
            <Route
              path="/registration/success"
              element={
                <PublicLayout>
                  <RegistrationSuccessPage />
                </PublicLayout>
              }
            />
            <Route
              path="/pass/:id"
              element={
                <PublicLayout>
                  <RegistrationSuccessPage />
                </PublicLayout>
              }
            />
            <Route
              path="/admin/login"
              element={
                <PublicLayout>
                  <LoginPage />
                </PublicLayout>
              }
            />

            {/* Protected Admin & Volunteer Routes with Left Sidebar + Top Bar */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <DashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/scanner"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'VOLUNTEER']}>
                  <AdminLayout>
                    <ScannerPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/registrations"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <RegistrationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <RegistrationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <DashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <RegistrationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/export"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <RegistrationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFoundPage />
                </PublicLayout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
