import React, { useRef } from 'react';

export const OtpInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
}> = ({ value, onChange, length = 6, autoFocus }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(length, ' ').split('');
    next[index] = digit || ' ';
    onChange(next.join('').trimEnd().slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    // Android keyboards / SMS autofill can drop the whole code into one box.
    if (clean.length > 1) {
      const code = clean.slice(0, length);
      onChange(code);
      inputsRef.current[Math.min(code.length, length - 1)]?.focus();
      return;
    }
    setDigit(index, clean);
    if (clean && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          autoFocus={autoFocus && i === 0}
          value={digit.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 sm:w-12 sm:h-[3.75rem] text-center font-display text-2xl font-bold text-ink rounded-2xl bg-surface-2 border outline-none transition-all focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)] ${
            digit.trim() ? 'border-line-strong' : 'border-line'
          }`}
        />
      ))}
    </div>
  );
};
