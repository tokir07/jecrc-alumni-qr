import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JecrcLogo } from './JecrcLogo';
import { QrCode, LayoutDashboard, Users, LogOut, LogIn, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="no-print bg-white text-[#172033] border-b border-[#E5E7EB] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Brand */}
          <Link to="/" className="flex items-center gap-3">
            <JecrcLogo size={36} />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/register"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/register')
                  ? 'bg-[#FEF2F2] text-[#E31827]'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100'
              }`}
            >
              <span>Alumni Registration</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/scanner"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/admin/scanner')
                      ? 'bg-[#E31827] text-white'
                      : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Gate Scanner</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-[#E31827] text-white'
                        : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/registrations"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/admin/registrations')
                        ? 'bg-[#E31827] text-white'
                        : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Directory</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <span className="text-xs font-bold text-[#172033] capitalize hidden md:inline">
                    {user?.username}
                  </span>
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#E31827] hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-[#172033] hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E31827]" />
                <span>Staff Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
