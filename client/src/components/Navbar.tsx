import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DiwaliLamp } from './DiwaliLamp';
import { QrCode, LayoutDashboard, Users, LogOut, LogIn, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="no-print bg-[#101A32] text-white border-b border-[#D9AD56]/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & University Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-[#493078]/40 border border-[#D9AD56]/40 group-hover:border-[#D9AD56] transition-all">
              <DiwaliLamp size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-wider text-white">
                  JECRC UNIVERSITY
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D9AD56]/20 text-[#D9AD56] border border-[#D9AD56]/40 uppercase tracking-widest hidden sm:inline-block">
                  Diwali 2026
                </span>
              </div>
              <p className="text-xs text-gray-300 tracking-wide">
                Alumni Association Get-Together
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Public Link */}
            <Link
              to="/register"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/register')
                  ? 'bg-[#D9AD56] text-[#101A32] shadow-sm'
                  : 'text-gray-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D9AD56]" />
              <span>Register</span>
            </Link>

            {isAuthenticated ? (
              <>
                {/* Admin/Volunteer Scanner Link */}
                <Link
                  to="/admin/scanner"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/admin/scanner')
                      ? 'bg-[#D9AD56] text-[#101A32] shadow-sm'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Scanner</span>
                </Link>

                {/* Admin Dashboard */}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/admin/dashboard')
                        ? 'bg-[#D9AD56] text-[#101A32] shadow-sm'
                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                )}

                {/* Admin Registrations */}
                {isAdmin && (
                  <Link
                    to="/admin/registrations"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/admin/registrations')
                        ? 'bg-[#D9AD56] text-[#101A32] shadow-sm'
                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden md:inline">Alumni List</span>
                  </Link>
                )}

                {/* User Profile Pill & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-bold text-white capitalize">{user?.username}</span>
                    <span className="text-[10px] text-[#D9AD56] font-medium tracking-wide">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition-all"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/admin/login"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/admin/login')
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LogIn className="w-4 h-4 text-[#D9AD56]" />
                <span className="hidden sm:inline">Admin / Volunteer</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
