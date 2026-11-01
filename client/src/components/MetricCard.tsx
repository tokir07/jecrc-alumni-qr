import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          {title}
        </span>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#E31827] shrink-0">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <p className="text-xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] sm:text-xs text-[#64748B] font-normal leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
