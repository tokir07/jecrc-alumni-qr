import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { DiwaliLamp } from './DiwaliLamp';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9EE]">
        <DiwaliLamp size={48} className="animate-bounce" />
        <p className="mt-4 text-sm font-semibold text-[#101A32] tracking-wider uppercase font-serif">
          Verifying Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If volunteer tries to visit admin dashboard, send to scanner
    if (user.role === 'VOLUNTEER') {
      return <Navigate to="/admin/scanner" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
