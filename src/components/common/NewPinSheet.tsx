import React, { useState } from 'react';
import { Sheet, SheetBody, SheetHeader } from '../ui/Sheet';
import { PinInput, PIN_LENGTH } from './PinInput';
import { formatIndianPhone } from '../../utils/format';
import { BadgeCheck, KeyRound } from 'lucide-react';

// The pop-up shown after a forgot-PIN verification: choose and confirm a new PIN.
export const NewPinSheet: React.FC<{
  open: boolean;
  verifiedPhone: string;
  onSubmit: (pin: string) => Promise<void>;
  onClose: () => void;
}> = ({ open, verifiedPhone, onSubmit, onClose }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    if (pin !== confirmPin) {
      setError('Both PINs must match.');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      await onSubmit(pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your new PIN. Try again.');
      setPin('');
      setConfirmPin('');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} label="Set a new PIN" widthClass="sm:max-w-md">
      <SheetHeader
        title="Set a new PIN"
        subtitle="Choose a 4-digit PIN you'll use to sign in."
        icon={<KeyRound className="w-5 h-5" />}
        onClose={onClose}
      />
      <SheetBody className="px-5 pb-[calc(1.25rem+var(--sa-bottom))] sm:pb-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-success-soft text-success-ink text-[13px]">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            <p>
              <span className="font-bold">{formatIndianPhone(verifiedPhone)}</span> verified
            </p>
          </div>
          <PinInput id="new-pin" label="New PIN" value={pin} onChange={setPin} autoFocus />
          <PinInput id="new-pin-confirm" label="Confirm new PIN" value={confirmPin} onChange={setConfirmPin} />
          {error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>}
          <button
            type="submit"
            disabled={isBusy || pin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH}
            className="btn btn-primary w-full h-[3.25rem] text-[15px]"
          >
            {isBusy ? 'Saving…' : 'Save new PIN'}
          </button>
        </form>
      </SheetBody>
    </Sheet>
  );
};
