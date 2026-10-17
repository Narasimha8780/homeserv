import React, { useState } from 'react';
import { useApp, type PhoneVerification } from '../../context/AppContext';
import { AuthLayout, PhoneField } from '../common/AuthLayout';
import { PinInput, PIN_LENGTH } from '../common/PinInput';
import { PhoneOtpVerifier } from '../common/PhoneOtpVerifier';
import { NewPinSheet } from '../common/NewPinSheet';
import { formatIndianPhone } from '../../utils/format';
import { ArrowLeft, IndianRupee, Phone, BadgeCheck, Wrench } from 'lucide-react';

export const CaptainLoginForm: React.FC<{ onNewCaptain: () => void }> = ({ onNewCaptain }) => {
  const { signInCaptain, resetPinWithVerification } = useApp();
  const [step, setStep] = useState<'signin' | 'forgot'>('signin');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [resetVerification, setResetVerification] = useState<PhoneVerification | null>(null);
  const [verifierKey, setVerifierKey] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = phone.length === 10 && pin.length === PIN_LENGTH;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      // On success AppContext signs the captain in and CaptainApp re-renders.
      await signInCaptain(formatIndianPhone(phone), pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Try again.');
      setPin('');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="For electricians, plumbers, drivers & more"
      headline={
        <>
          Get more customers. <span className="text-gradient">Pay nothing.</span>
        </>
      }
      sub="List your service on HomeServ for free and get calls directly from customers in your city."
      benefits={[
        { icon: IndianRupee, title: '0% commission, forever', body: 'Customers pay you directly — we never take a cut.' },
        { icon: Phone, title: 'Direct calls & WhatsApp', body: 'No app to learn. Customers simply call you.' },
        { icon: BadgeCheck, title: 'Verified badge', body: 'Get ID-verified once and stand out from the crowd.' },
      ]}
      stats={[
        { value: '₹0', label: 'Listing fee' },
        { value: '2 min', label: 'To sign up' },
        { value: '24h', label: 'Verification' },
      ]}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent-ink flex items-center justify-center">
          <Wrench className="w-5 h-5" />
        </span>
        <span className="font-display text-lg font-bold text-ink">Captain login</span>
      </div>

      {step === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <p className="text-sm text-ink-3 -mt-2">
            Sign in with your mobile number and the 4-digit PIN you chose when you listed your service.
          </p>
          <PhoneField id="captain-phone" value={phone} onChange={setPhone} autoFocus />
          <PinInput id="captain-pin" label="Your PIN" value={pin} onChange={setPin} />
          {error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>}
          <button type="submit" disabled={isBusy || !ready} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isBusy ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('forgot');
              setPin('');
              setError(null);
              setVerifierKey((k) => k + 1);
            }}
            className="w-full text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
          >
            Forgot your PIN?
          </button>

          <div className="flex items-center gap-3 pt-1">
            <span className="flex-1 h-px bg-line" />
            <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">New here</span>
            <span className="flex-1 h-px bg-line" />
          </div>

          <button type="button" onClick={onNewCaptain} className="btn btn-ghost w-full h-[3.25rem] text-[15px] border border-line">
            List your service — it's free
          </button>
        </form>
      )}

      {step === 'forgot' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setStep('signin');
              setError(null);
            }}
            className="btn btn-ghost h-9 pl-1.5 pr-3 -ml-1.5 -mt-2 text-[13px]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </button>
          <div>
            <h2 className="text-xl font-bold text-ink">Forgot your PIN?</h2>
            <p className="text-sm text-ink-3 mt-1">Verify your number on WhatsApp, then choose a new PIN.</p>
          </div>
          <PhoneOtpVerifier
            key={verifierKey}
            purpose="reset"
            role="captain"
            idPrefix="captain-forgot"
            initialPhone={phone}
            onVerified={setResetVerification}
          />
        </div>
      )}

      <NewPinSheet
        open={!!resetVerification}
        verifiedPhone={resetVerification?.phone ?? ''}
        onSubmit={async (newPin) => {
          // Signs the captain straight in — they just proved they hold the number.
          await resetPinWithVerification(resetVerification!.verificationToken, newPin, 'captain');
          setResetVerification(null);
        }}
        onClose={() => {
          setResetVerification(null);
          setVerifierKey((k) => k + 1);
        }}
      />
    </AuthLayout>
  );
};
