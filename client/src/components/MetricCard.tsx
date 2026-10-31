import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  colorTheme?: 'navy' | 'purple' | 'gold' | 'green' | 'orange';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorTheme = 'navy',
}) => {
  const colorMap = {
    navy: {
      border: 'border-[#101A32]/20',
      iconBg: 'bg-[#101A32]/10',
      iconColor: 'text-[#101A32]',
    },
    purple: {
      border: 'border-[#493078]/20',
      iconBg: 'bg-[#493078]/10',
      iconColor: 'text-[#493078]',
    },
    gold: {
      border: 'border-[#D9AD56]/40',
      iconBg: 'bg-[#D9AD56]/15',
      iconColor: 'text-[#B88F3B]',
    },
    green: {
      border: 'border-[#16845B]/30',
      iconBg: 'bg-[#16845B]/15',
      iconColor: 'text-[#16845B]',
    },
    orange: {
      border: 'border-[#D98A22]/30',
      iconBg: 'bg-[#D98A22]/15',
      iconColor: 'text-[#D98A22]',
    },
  };

  const currentTheme = colorMap[colorTheme];

  return (
    <div
      className={`bg-white rounded-2xl p-6 border ${currentTheme.border} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-[#101A32] mt-2 font-serif">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3.5 rounded-xl ${currentTheme.iconBg} ${currentTheme.iconColor}`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};
