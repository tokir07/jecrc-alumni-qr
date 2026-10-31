import React from 'react';

interface JecrcLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const JecrcCrest: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle */}
      <circle cx="50" cy="50" r="47" stroke="#E31827" strokeWidth="3" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="42" stroke="#E31827" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      
      {/* Outer Ring Text Path */}
      <path
        id="textCircle"
        d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
        fill="none"
      />
      <text fill="#E31827" fontSize="7" fontWeight="bold" letterSpacing="1.5">
        <textPath href="#textCircle" startOffset="18%">
          JECRC ALUMNI
        </textPath>
      </text>

      {/* Center Shield / Torch Symbol */}
      <path
        d="M50 24L65 31V48C65 58 58 66 50 70C42 66 35 58 35 48V31L50 24Z"
        fill="#FEF2F2"
        stroke="#E31827"
        strokeWidth="2"
      />
      
      {/* Torch Flame */}
      <path
        d="M50 32C50 32 54 37 54 41C54 43.5 52.2 45 50 45C47.8 45 46 43.5 46 41C46 37 50 32 50 32Z"
        fill="#E31827"
      />
      {/* Inner Flame Core */}
      <path
        d="M50 37C50 37 52 39.5 52 41C52 42.1 51.1 43 50 43C48.9 43 48 42.1 48 41C48 39.5 50 37 50 37Z"
        fill="#FFFFFF"
      />
      
      {/* Torch Handle */}
      <path d="M48 45H52V56H48V45Z" fill="#E31827" />
      <path d="M46 56H54V59H46V56Z" fill="#E31827" />

      {/* Decorative Laurel Leaves */}
      <path d="M38 52C36 50 36 46 37 44" stroke="#E31827" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M62 52C64 50 64 46 63 44" stroke="#E31827" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const JecrcLogo: React.FC<JecrcLogoProps> = ({
  className = '',
  size = 40,
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <JecrcCrest size={size} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-sm tracking-tight text-[#E31827] uppercase">
              JECRC
            </span>
            <span className="font-bold text-sm tracking-tight text-[#172033] uppercase">
              ALUMNI
            </span>
          </div>
          <span className="text-[10px] text-[#64748B] font-medium tracking-wider uppercase mt-0.5">
            Diwali 2026 Portal
          </span>
        </div>
      )}
    </div>
  );
};
