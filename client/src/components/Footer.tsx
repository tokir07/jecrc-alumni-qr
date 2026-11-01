import React from 'react';
import { Link } from 'react-router-dom';
import { JecrcLogo } from './JecrcLogo';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-white text-[#64748B] border-t border-[#E5E7EB] py-6 mt-auto pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs">
          <div className="flex items-center justify-center gap-3 shrink-0">
            <JecrcLogo size={26} universityHeight={22} alumniSize={24} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[#64748B] text-center md:text-right">
            <span className="leading-relaxed text-[11px] sm:text-xs">
              © 2026 JECRC University Alumni Association • Ramchandrapura, Sitapura, Jaipur
            </span>
            <Link
              to="/admin/login"
              className="text-[11px] text-[#94A3B8] hover:text-[#E31827] transition-colors inline-flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-gray-50 min-h-[40px]"
              title="Restricted Staff & Gate Entry"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Staff Access</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
