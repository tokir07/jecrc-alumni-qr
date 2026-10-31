import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { JecrcCrest } from './JecrcLogo';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFB]">
        <JecrcCrest size={48} className="animate-pulse" />
        <p className="mt-3 text-xs font-semibold text-[#172033] tracking-wider uppercase">
          Verifying Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'VOLUNTEER') {
      return <Navigate to="/admin/scanner" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
