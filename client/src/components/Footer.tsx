import React from 'react';
import { DiwaliLamp } from './DiwaliLamp';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-[#101A32] text-white border-t border-[#D9AD56]/30 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <DiwaliLamp size={28} />
            <div>
              <p className="font-serif font-bold text-sm tracking-wide text-[#E5C174]">
                JECRC UNIVERSITY ALUMNI ASSOCIATION
              </p>
              <p className="text-xs text-gray-400">
                Diwali Get-Together 2026 • Official Entry & Registration Portal
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" />
            <span>for the JECRC Alumni Community</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-gray-500">
          © 2026 JECRC University, Jaipur. All rights reserved. For queries, contact alumni@jecrcu.edu.in
        </div>
      </div>
    </footer>
  );
};
