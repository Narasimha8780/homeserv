import React, { useRef } from 'react';

const ACCENT_CLASSES = {
  blue: 'focus:border-blue-500 focus:ring-blue-500/15',
  orange: 'focus:border-orange-500 focus:ring-orange-500/15',
};

export const OtpInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  accent?: keyof typeof ACCENT_CLASSES;
}> = ({ value, onChange, length = 6, autoFocus, accent = 'blue' }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  const setDigit = (index: number, digit: string) => {
    const next = value.split('');
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) inputsRef.current[index + 1]?.focus();
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
      const focusIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          value={digit.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all ${ACCENT_CLASSES[accent]}`}
        />
      ))}
    </div>
  );
};
