import React from 'react';

export const DiwaliLamp: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <defs>
        <linearGradient id="lampFlameGrad" x1="32" y1="6" x2="32" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF416C" />
          <stop offset="0.5" stopColor="#FF4B2B" />
          <stop offset="1" stopColor="#FFD200" />
        </linearGradient>
        <linearGradient id="lampGoldGrad" x1="10" y1="32" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9D423" />
          <stop offset="0.5" stopColor="#D9AD56" />
          <stop offset="1" stopColor="#9E731C" />
        </linearGradient>
      </defs>
      {/* Flame */}
      <path
        d="M32 6C32 6 40 17 40 25C40 30 36.4 33.5 32 33.5C27.6 33.5 24 30 24 25C24 17 32 6 32 6Z"
        fill="url(#lampFlameGrad)"
      />
      <path
        d="M32 15C32 15 36 21 36 25C36 27.5 34.2 29.5 32 29.5C29.8 29.5 28 27.5 28 25C28 21 32 15 32 15Z"
        fill="#FFF9EE"
      />
      {/* Bowl */}
      <path
        d="M10 32C10 32 13 47 32 47C51 47 54 32 54 32C54 32 46 39 32 39C18 39 10 32 10 32Z"
        fill="url(#lampGoldGrad)"
      />
      <ellipse cx="32" cy="33" rx="22" ry="5.5" fill="#8C6615" />
      <ellipse cx="32" cy="32" rx="20" ry="4" fill="#342256" />
      {/* Base stand */}
      <path d="M26 46L23 54C23 55.5 24.5 56.5 26 56.5H38C39.5 56.5 41 55.5 41 54L38 46H26Z" fill="url(#lampGoldGrad)" />
    </svg>
  );
};
