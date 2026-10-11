import React, { useState } from 'react';
import { initials } from '../../utils/format';

const GRADIENTS = [
  'from-orange-400 to-rose-500',
  'from-sky-400 to-indigo-500',
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-fuchsia-500',
  'from-amber-400 to-orange-600',
  'from-cyan-400 to-blue-600',
];

const gradientFor = (name: string) =>
  GRADIENTS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % GRADIENTS.length];

// Photo avatar that degrades to coloured initials when there's no photo or it fails to
// load (slow networks, blocked image hosts) instead of showing a broken image.
export const Avatar: React.FC<{ src?: string; name: string; className?: string; textClassName?: string }> = ({
  src,
  name,
  className = 'w-12 h-12 rounded-2xl',
  textClassName = 'text-base',
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) {
    return (
      <span
        className={`${className} ${textClassName} bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center font-display font-bold text-white shrink-0 select-none`}
        aria-label={name}
        role="img"
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={`${className} object-cover shrink-0 bg-surface-2`}
    />
  );
};
