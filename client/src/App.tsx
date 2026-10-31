import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { RegisterPage } from './pages/RegisterPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
