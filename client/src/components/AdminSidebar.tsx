import React from 'react';
import { NavLink } from 'react-router-dom';
import { JecrcLogo } from './JecrcLogo';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  QrCode,
  CheckSquare,
  FileSpreadsheet,
  Settings,
  BarChart3,
  LogOut,
  X,
  SidebarClose,
  Sparkles,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all relative ${
      isActive
        ? 'bg-[#FEF2F2] text-[#E31827] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#E31827] before:rounded-r'
        : 'text-[#64748B] hover:text-[#172033] hover:bg-gray-100/70'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <JecrcLogo size={34} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Section: CORE OPERATIONS */}
          <div>
            <p className="px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
              Core Operations
            </p>
            <nav className="space-y-1">
              {isAdmin && (
                <NavLink to="/admin/dashboard" className={navItemClass} onClick={onClose}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </NavLink>
              )}

              {isAdmin && (
                <NavLink to="/admin/registrations" className={navItemClass} onClick={onClose}>
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Alumni Directory</span>
                </NavLink>
              )}

              <NavLink to="/admin/scanner" className={navItemClass} onClick={onClose}>
                <QrCode className="w-4 h-4 shrink-0" />
                <span>QR Scanner</span>
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#16845B] border border-emerald-200">
                  Live
                </span>
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin/attendance" className={navItemClass} onClick={onClose}>
                  <CheckSquare className="w-4 h-4 shrink-0" />
                  <span>Attendance Records</span>
                </NavLink>
              )}

              {isAdmin && (
                <NavLink to="/admin/export" className={navItemClass} onClick={onClose}>
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>Export Data</span>
                </NavLink>
              )}
            </nav>
          </div>

          {/* Section: SYSTEM */}
          <div>
            <p className="px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
              System
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin/analytics" className={navItemClass} onClick={onClose}>
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Analytics</span>
              </NavLink>

              <NavLink to="/admin/settings" className={navItemClass} onClick={onClose}>
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </NavLink>

              <NavLink to="/register" className={navItemClass} target="_blank">
                <Sparkles className="w-4 h-4 shrink-0 text-[#E31827]" />
                <span>Public Portal</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Footer Card */}
        <div className="p-4 border-t border-[#E5E7EB] bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#E31827]/10 border border-[#E31827]/20 flex items-center justify-center text-xs font-bold text-[#E31827] shrink-0">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#172033] truncate">
                  {user?.username}
                </p>
                <p className="text-[10px] font-medium text-[#64748B] truncate">
                  {user?.role === 'ADMIN' ? 'Administrator' : 'Gate Volunteer'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-[#E31827] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
