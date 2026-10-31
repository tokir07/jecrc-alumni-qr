import React from 'react';
import { JecrcLogo } from './JecrcLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-white text-[#64748B] border-t border-[#E5E7EB] py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
          <div className="flex items-center gap-3">
            <JecrcLogo size={28} />
          </div>

          <div className="text-[#64748B]">
            © 2026 JECRC University Alumni Association • Ramchandrapura, Sitapura, Jaipur • alumni@jecrcu.edu.in
          </div>
        </div>
      </div>
    </footer>
  );
};
