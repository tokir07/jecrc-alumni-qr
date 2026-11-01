import React from 'react';
import { Link } from 'react-router-dom';
import { JecrcCrest } from '../components/JecrcLogo';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-8">
      <JecrcCrest size={48} className="mb-4 shrink-0" />
      <h1 className="text-4xl sm:text-5xl font-extrabold text-[#172033]">404</h1>
      <h2 className="text-base sm:text-lg font-bold text-[#64748B] mt-1">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-sm leading-relaxed">
        The requested URL was not found on this server.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px] touch-manipulation"
      >
        <Home className="w-4 h-4 text-white" />
        <span>Return to Registration Portal</span>
      </Link>
    </div>
  );
};
