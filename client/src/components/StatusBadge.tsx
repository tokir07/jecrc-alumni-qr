import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export const StatusBadge: React.FC<{ isCheckedIn: boolean }> = ({ isCheckedIn }) => {
  if (isCheckedIn) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#16845B]/15 text-[#16845B] border border-[#16845B]/30">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Checked In
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D98A22]/15 text-[#D98A22] border border-[#D98A22]/30">
      <Clock className="w-3.5 h-3.5" />
      Pending Entry
    </span>
  );
};
