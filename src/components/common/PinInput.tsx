import React, { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PIN_LENGTH = 4;

// Boxed 4-digit PIN entry. Masked by default so the PIN isn't readable over a
// shoulder, with a reveal toggle for people who mistype.
export const PinInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  label?: string;
  id?: string;
}> = ({ value, onChange, autoFocus, label, id }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const digits = value.padEnd(PIN_LENGTH, ' ').split('').slice(0, PIN_LENGTH);

  const handleChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (clean.length > 1) {
      const next = clean.slice(0, PIN_LENGTH);
      onChange(next);
      inputsRef.current[Math.min(next.length, PIN_LENGTH - 1)]?.focus();
      return;
    }
    const next = value.padEnd(PIN_LENGTH, ' ').split('');
    next[index] = clean || ' ';
    onChange(next.join('').trimEnd().slice(0, PIN_LENGTH));
    if (clean && index < PIN_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="field-label mb-0" htmlFor={id ? `${id}-0` : undefined}>{label}</label>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="flex items-center gap-1 text-[11px] font-semibold text-ink-3 hover:text-ink transition-colors"
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {revealed ? 'Hide' : 'Show'}
          </button>
        </div>
      )}
      <div className="flex items-center gap-2.5">
        {digits.map((digit, i) => (
          <input
            key={i}
            id={id ? `${id}-${i}` : undefined}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type={revealed ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={1}
            autoComplete="off"
            aria-label={`${label || 'PIN'} digit ${i + 1}`}
            autoFocus={autoFocus && i === 0}
            value={digit.trim()}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={`w-full h-14 text-center font-display text-2xl font-bold text-ink rounded-2xl bg-surface-2 border outline-none transition-all focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)] ${
              digit.trim() ? 'border-line-strong' : 'border-line'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
