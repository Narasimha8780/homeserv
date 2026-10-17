import React from 'react';
import { formatIndianPhone } from '../../utils/format';
import { KeyRound, RotateCcw, UserCheck } from 'lucide-react';

// Shown when someone tries to sign up with a number that already has an account:
// offer the two ways back in instead of a dead-end error.
export const AlreadyRegisteredPanel: React.FC<{
  phone: string;
  onEnterPin: () => void;
  onResetPin: () => void;
  onUseDifferentNumber: () => void;
}> = ({ phone, onEnterPin, onResetPin, onUseDifferentNumber }) => (
  <div className="space-y-4">
    <div className="text-center">
      <span className="w-14 h-14 rounded-2xl bg-accent-soft text-accent-ink flex items-center justify-center mx-auto">
        <UserCheck className="w-7 h-7" />
      </span>
      <h2 className="mt-3 text-2xl font-bold text-ink">You're already registered</h2>
      <p className="text-sm text-ink-3 mt-1">
        <span className="font-semibold text-ink">{formatIndianPhone(phone)}</span> already has an account.
      </p>
    </div>

    <button type="button" onClick={onEnterPin} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
      <KeyRound className="w-5 h-5" />
      Enter my 4-digit PIN
    </button>
    <button type="button" onClick={onResetPin} className="btn btn-ghost w-full h-[3.25rem] text-[15px] border border-line">
      <RotateCcw className="w-5 h-5" />
      Forgot PIN? Set a new one
    </button>

    <button
      type="button"
      onClick={onUseDifferentNumber}
      className="w-full text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
    >
      Use a different number
    </button>
  </div>
);
