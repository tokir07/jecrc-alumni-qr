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
    <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-xs hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#E31827] shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-[#64748B] font-normal leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
