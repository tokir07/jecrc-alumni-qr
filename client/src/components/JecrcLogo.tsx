import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  height?: number;
}

/**
 * Official JECRC University Logo (provided by user)
 */
export const JecrcUniversityLogo: React.FC<LogoProps> = ({
  className = '',
  height = 36,
}) => {
  return (
    <img
      src="/jecrc-university-logo.png"
      alt="JECRC University"
      style={{ height: `${height}px` }}
      className={`object-contain ${className}`}
      loading="eager"
    />
  );
};

/**
 * Official JECRC Alumni Association Color Logo (provided by user)
 */
export const JecrcAlumniLogo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
}) => {
  return (
    <img
      src="/jecrc-alumni-logo.png"
      alt="JECRC Alumni Association"
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`object-contain rounded-full ${className}`}
      loading="eager"
    />
  );
};

/**
 * Alias for the circular alumni crest
 */
export const JecrcCrest: React.FC<{ size?: number; className?: string }> = ({
  size = 44,
  className = '',
}) => {
  return <JecrcAlumniLogo size={size} className={className} />;
};

/**
 * Combined Institutional Brand Header
 * Shows both JECRC University and Alumni Association logos side by side
 * exactly matching the reference screenshot top left header.
 */
export const JecrcCombinedLogo: React.FC<{
  className?: string;
  size?: number;
  universityHeight?: number;
  alumniSize?: number;
  showSubtitle?: boolean;
}> = ({
  className = '',
  size,
  universityHeight = 32,
  alumniSize = 34,
  showSubtitle = true,
}) => {
  const uHeight = size ? Math.round(size * 0.85) : universityHeight;
  const aSize = size ? Math.round(size * 0.9) : alumniSize;

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0 ${className}`}>
      <JecrcUniversityLogo height={uHeight} className="shrink-0 max-w-[110px] sm:max-w-none" />
      <div className="h-5 sm:h-6 w-[1px] bg-gray-200 shrink-0" />
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <JecrcAlumniLogo size={aSize} className="shrink-0" />
        {showSubtitle && (
          <div className="flex flex-col leading-none">
            <span className="text-[11px] sm:text-[12px] font-bold text-[#E31827] uppercase tracking-tight">
              ALUMNI
            </span>
            <span className="text-[8px] sm:text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mt-0.5 hidden xs:inline sm:inline">
              ASSOCIATION
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const JecrcLogo = JecrcCombinedLogo;
