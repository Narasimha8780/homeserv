import React, { useId } from 'react';

// Brand mark: a home with a check — "verified help for your home".
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0 drop-shadow-[0_4px_14px_rgba(255,122,26,0.45)]`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc046" />
          <stop offset="0.55" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#ff5a36" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${id})`} />
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 31.5 32 17l17 14.5" strokeWidth="5" />
        <path d="M20.5 28v15.5a3.5 3.5 0 0 0 3.5 3.5h16a3.5 3.5 0 0 0 3.5-3.5V28" strokeWidth="5" />
        <path d="m26.5 37.5 4 4 7.5-8" strokeWidth="4.5" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<{ markClassName?: string; textClassName?: string; hideTextOnTiny?: boolean }> = ({
  markClassName = 'w-9 h-9',
  textClassName = 'text-xl',
  hideTextOnTiny,
}) => (
  <span className="flex items-center gap-2">
    <LogoMark className={markClassName} />
    <span
      className={`font-display font-extrabold tracking-tight text-ink ${textClassName} ${hideTextOnTiny ? 'hidden min-[380px]:inline' : ''}`}
    >
      Home<span className="text-gradient">Serv</span>
    </span>
  </span>
);
