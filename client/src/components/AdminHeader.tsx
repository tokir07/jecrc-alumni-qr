import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  SlidersHorizontal,
  FileSpreadsheet,
  Bell,
  Menu,
  User as UserIcon,
  LogOut,
  QrCode,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  searchQuery = '',
  onSearchChange,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleExportCsv = async () => {
    try {
      await adminService.downloadExportCsv();
    } catch {
      alert('Failed to export CSV. Please try again.');
    }
  };

  return (
    <header className="no-print h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left Search Bar & Mobile Menu Toggle */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/admin/registrations?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            placeholder="Search alumni, batches, companies, ID..."
            className="w-full pl-9 pr-14 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] focus:ring-1 focus:ring-[#E31827]/20 outline-none transition-all text-[#172033] bg-[#FAFAFB]"
          />
          <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-400 border border-gray-200 bg-white">
            Ctrl+K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Advanced Filters Button */}
        <Link
          to="/admin/registrations"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-[#172033] hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#E31827]" />
          <span>Advanced Filters</span>
        </Link>

        {/* Batch CSVs Button */}
        {isAdmin && (
          <button
            onClick={handleExportCsv}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-[#172033] hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#E31827]" />
            <span>Batch CSVs</span>
          </button>
        )}

        {/* Scanner Shortcut */}
        <Link
          to="/admin/scanner"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">Gate Scanner</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#E31827] absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
            <UserIcon className="w-4 h-4 text-[#172033]" />
          </div>

          <div className="hidden xl:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-[#172033] capitalize">
              {user?.username || 'Admin Officer'}
            </span>
            <span className="text-[10px] text-[#64748B] font-medium">
              {user?.role === 'ADMIN' ? 'Internal Team' : 'Gate Volunteer'}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 text-gray-400 hover:text-[#E31827] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

