import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JecrcLogo } from './JecrcLogo';
import { QrCode, LayoutDashboard, Users, LogOut, Menu, X, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="no-print bg-white text-[#172033] border-b border-[#E5E7EB] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 py-2">
            <JecrcLogo size={32} universityHeight={26} alumniSize={28} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <Link
              to="/register"
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[38px] flex items-center ${
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[38px] ${
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
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[38px] ${
                      isActive('/admin/dashboard')
                        ? 'bg-[#E31827] text-white'
                        : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/registrations"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[38px] ${
                      isActive('/admin/registrations')
                        ? 'bg-[#E31827] text-white'
                        : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Directory</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <span className="text-xs font-bold text-[#172033] capitalize">
                    {user?.username}
                  </span>
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-2 rounded-lg text-gray-400 hover:text-[#E31827] hover:bg-red-50 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            {!isAuthenticated ? (
              <Link
                to="/register"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[44px] flex items-center ${
                  isActive('/register')
                    ? 'bg-[#FEF2F2] text-[#E31827]'
                    : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100'
                }`}
              >
                <span>Register</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/admin/scanner"
                  className="p-2.5 rounded-xl bg-[#E31827] text-white text-xs font-semibold flex items-center justify-center min-h-[44px] min-w-[44px]"
                  title="Scanner"
                >
                  <QrCode className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 rounded-xl border border-gray-200 text-[#172033] hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Toggle navigation"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown for Authenticated Staff */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-2 shadow-lg animate-fadeIn">
          <div className="px-3 py-2 bg-gray-50 rounded-xl mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#172033] capitalize">{user?.username}</p>
              <p className="text-[10px] text-[#64748B] font-medium">{user?.role === 'ADMIN' ? 'Administrator' : 'Gate Volunteer'}</p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] bg-red-50 hover:bg-red-100 min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-semibold min-h-[44px] ${
              isActive('/register') ? 'bg-[#FEF2F2] text-[#E31827]' : 'text-[#172033] hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#E31827]" />
            <span>Alumni Registration Form</span>
          </Link>

          <Link
            to="/admin/scanner"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-semibold min-h-[44px] ${
              isActive('/admin/scanner') ? 'bg-[#E31827] text-white' : 'text-[#172033] hover:bg-gray-50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Gate Scanner</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-semibold min-h-[44px] ${
                isActive('/admin/dashboard') ? 'bg-[#E31827] text-white' : 'text-[#172033] hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Operations Dashboard</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/registrations"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-semibold min-h-[44px] ${
                isActive('/admin/registrations') ? 'bg-[#E31827] text-white' : 'text-[#172033] hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Alumni Directory & Records</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
