import React from 'react';
import { Link } from 'react-router-dom';
import { DiwaliLamp } from '../components/DiwaliLamp';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <DiwaliLamp size={48} className="mb-4" />
      <h1 className="text-4xl sm:text-5xl font-black font-serif text-[#101A32]">404</h1>
      <h2 className="text-lg font-bold text-gray-700 mt-2 font-serif">Page Not Found</h2>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101A32] text-white text-xs font-semibold hover:bg-[#1B2A50] transition-all"
      >
        <Home className="w-4 h-4 text-[#D9AD56]" />
        <span>Return to Registration Portal</span>
      </Link>
    </div>
  );
};
