import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export const StatusBadge: React.FC<{ isCheckedIn: boolean }> = ({ isCheckedIn }) => {
  if (isCheckedIn) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF7F2] text-[#16845B] border border-[#16845B]/20 shrink-0 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 shrink-0" />
        <span>Checked In</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF6EA] text-[#D98A22] border border-[#D98A22]/20 shrink-0 whitespace-nowrap">
      <Clock className="w-3 h-3 shrink-0" />
      <span>Pending Entry</span>
    </span>
  );
};
