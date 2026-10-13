import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthLayout, PhoneField } from '../common/AuthLayout';
import { PinInput, PIN_LENGTH } from '../common/PinInput';
import { PhoneEmailButton } from '../common/PhoneEmailButton';
import { phoneEmailEnabled } from '../../utils/phoneEmailConfig';
import { formatIndianPhone } from '../../utils/format';
import { ArrowLeft, IndianRupee, Phone, BadgeCheck, Wrench, CheckCircle2, KeyRound } from 'lucide-react';

const VERIFY_ENABLED = phoneEmailEnabled();

export const CaptainLoginForm: React.FC<{ onNewCaptain: (phone: string) => void }> = ({ onNewCaptain }) => {
  const { signInCaptain, requestPinReset, verifyPhoneEmail, resetPinWithVerification } = useApp();
  const [step, setStep] = useState<'signin' | 'forgot' | 'forgotNewPin' | 'forgotSent'>('signin');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [verification, setVerification] = useState<{ token: string; phone: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = formatIndianPhone(phone);
  const ready = phone.length === 10 && pin.length === PIN_LENGTH;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      // On success AppContext signs the captain in and CaptainApp re-renders.
      await signInCaptain(fullPhone, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Try again.');
      setPin('');
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerified = async (userJsonUrl: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const result = await verifyPhoneEmail(userJsonUrl);
      setVerification({ token: result.verificationToken, phone: result.phone });
      setPin('');
      setConfirmPin('');
      setStep('forgotNewPin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm your number. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSetNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy || !verification) return;
    if (pin !== confirmPin) {
      setError('Both PINs must match.');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      await resetPinWithVerification(verification.token, pin, 'captain');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set your new PIN. Try again.');
      setPin('');
      setConfirmPin('');
    } finally {
      setIsBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      await requestPinReset(fullPhone, 'captain');
      setStep('forgotSent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const errorText = error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>;

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
          {errorText}
          <button type="submit" disabled={isBusy || !ready} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isBusy ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('forgot'); setError(null); }}
            className="w-full text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
          >
            Forgot your PIN?
          </button>

          <div className="flex items-center gap-3 pt-1">
            <span className="flex-1 h-px bg-line" />
            <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">New here</span>
            <span className="flex-1 h-px bg-line" />
          </div>

          <button
            type="button"
            onClick={() => onNewCaptain(phone.length === 10 ? fullPhone : '')}
            className="btn btn-ghost w-full h-[3.25rem] text-[15px] border border-line"
          >
            List your service — it's free
          </button>
        </form>
      )}

      {step === 'forgot' && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => { setStep('signin'); setError(null); }}
            className="btn btn-ghost h-9 pl-1.5 pr-3 -ml-1.5 -mt-2 text-[13px]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </button>
          <div>
            <h2 className="text-xl font-bold text-ink">Forgot your PIN?</h2>
            <p className="text-sm text-ink-3 mt-1">
              {VERIFY_ENABLED
                ? 'Verify your mobile number and choose a new PIN right away.'
                : 'Confirm your number and our team will call you to verify, then reset it.'}
            </p>
          </div>
          {errorText}
          {VERIFY_ENABLED ? (
            <>
              <PhoneEmailButton onVerified={handleVerified} disabled={isBusy} />
              {isBusy && <p className="text-sm text-ink-3 text-center">Confirming your number…</p>}
            </>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <PhoneField id="captain-forgot-phone" value={phone} onChange={setPhone} autoFocus />
              <button type="submit" disabled={isBusy || phone.length !== 10} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
                {isBusy ? 'Sending…' : 'Request a PIN reset'}
              </button>
            </form>
          )}
        </div>
      )}

      {step === 'forgotNewPin' && (
        <form onSubmit={handleSetNewPin} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Choose a new PIN</h2>
            <p className="text-sm text-ink-3 mt-1">Pick a new 4-digit PIN for your captain account.</p>
          </div>
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-success-soft text-success-ink text-[13px]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p><span className="font-bold">+91 {verification?.phone}</span> verified</p>
          </div>
          <PinInput id="captain-new-pin" label="New PIN" value={pin} onChange={setPin} autoFocus />
          <PinInput id="captain-new-pin-confirm" label="Re-enter new PIN" value={confirmPin} onChange={setConfirmPin} />
          {errorText}
          <button
            type="submit"
            disabled={isBusy || pin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH}
            className="btn btn-primary w-full h-[3.25rem] text-[15px]"
          >
            {isBusy ? 'Saving…' : 'Set new PIN'}
          </button>
        </form>
      )}

      {step === 'forgotSent' && (
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-success-soft text-success-ink flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Request received</h2>
            <p className="text-sm text-ink-3 mt-1.5">
              We'll call <span className="font-semibold text-ink">{fullPhone}</span> to confirm it's you, then clear your PIN.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-surface-2 border border-line text-[13px] text-ink-2 text-left">
            <KeyRound className="w-4 h-4 shrink-0 mt-px text-accent-ink" />
            <p>Your listing stays live the whole time — only sign-in is affected.</p>
          </div>
          <button
            type="button"
            onClick={() => { setStep('signin'); setPin(''); setError(null); }}
            className="btn btn-primary w-full h-[3.25rem] text-[15px]"
          >
            Back to sign in
          </button>
        </div>
      )}
    </AuthLayout>
  );
};
