import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
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
        <PublicLayout>
          <Routes>
            {/* Public Alumni Routes */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registration/success" element={<RegistrationSuccessPage />} />
            <Route path="/pass/:id" element={<RegistrationSuccessPage />} />

            {/* Portal Authentication */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected Volunteer & Admin Scanner */}
            <Route
              path="/admin/scanner"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'VOLUNTEER']}>
                  <ScannerPage />
                </ProtectedRoute>
              }
            />

            {/* Strictly Protected Admin Only Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/registrations"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <RegistrationsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PublicLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
