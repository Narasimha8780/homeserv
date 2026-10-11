import React from 'react';

export const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full border transition-colors duration-200 ${
      checked ? 'bg-success border-transparent' : 'bg-surface-3 border-line-strong'
    }`}
  >
    <span
      className={`inline-block h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform duration-200 ${
        checked ? 'translate-x-[1.375rem]' : 'translate-x-1'
      }`}
    />
  </button>
);
