import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthLayout, PhoneField } from '../common/AuthLayout';
import { PinInput, PIN_LENGTH } from '../common/PinInput';
import { PhoneEmailButton } from '../common/PhoneEmailButton';
import { phoneEmailEnabled } from '../../utils/phoneEmailConfig';
import { formatIndianPhone } from '../../utils/format';
import { ArrowLeft, BadgeCheck, Star, Phone, ShieldCheck, Users, KeyRound, CheckCircle2 } from 'lucide-react';

type Mode = 'signup' | 'signin';
type Step = 'form' | 'verify' | 'details' | 'forgot' | 'forgotNewPin' | 'forgotSent';

const VERIFY_ENABLED = phoneEmailEnabled();

export const CustomerAuthGate: React.FC = () => {
  const {
    signUpCustomer, signInCustomer, requestPinReset, verifyPhoneEmail, resetPinWithVerification,
    categories, allCities, t,
  } = useApp();

  const [mode, setMode] = useState<Mode>('signup');
  const [step, setStep] = useState<Step>(VERIFY_ENABLED ? 'verify' : 'form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [verification, setVerification] = useState<{ token: string; phone: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typedPhone = formatIndianPhone(phone);
  const verifiedPhone = verification ? formatIndianPhone(verification.phone) : '';
  const pinsFilled = pin.length === PIN_LENGTH && confirmPin.length === PIN_LENGTH;

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep(next === 'signup' && VERIFY_ENABLED ? 'verify' : 'form');
    setPin('');
    setConfirmPin('');
    setVerification(null);
    setError(null);
  };

  // Shared by signup and forgot-PIN: turn the widget's URL into a server-issued token.
  const handleVerified = (nextStep: Step) => async (userJsonUrl: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const result = await verifyPhoneEmail(userJsonUrl);
      setVerification({ token: result.verificationToken, phone: result.phone });
      if (result.name && !name.trim()) setName(result.name);
      setPin('');
      setConfirmPin('');
      setStep(nextStep);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm your number. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    if (pin !== confirmPin) {
      setError('Both PINs must match.');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      await signUpCustomer(name.trim(), verification?.phone || typedPhone, pin, verification?.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Try again.');
      setPin('');
      setConfirmPin('');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      await signInCustomer(typedPhone, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Try again.');
      setPin('');
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
      await resetPinWithVerification(verification.token, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set your new PIN. Try again.');
      setPin('');
      setConfirmPin('');
    } finally {
      setIsBusy(false);
    }
  };

  // Fallback when phone.email isn't configured: an admin clears the PIN by hand.
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      await requestPinReset(typedPhone);
      setStep('forgotSent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const errorText = error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>;

  const verifiedBadge = (
    <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-success-soft text-success-ink text-[13px]">
      <BadgeCheck className="w-4 h-4 shrink-0" />
      <p>
        <span className="font-bold">{verifiedPhone}</span> verified
      </p>
    </div>
  );

  const backButton = (onClick: () => void, label: string) => (
    <button type="button" onClick={onClick} className="btn btn-ghost h-9 pl-1.5 pr-3 -ml-1.5 text-[13px]">
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  );

  const showTabs = step === 'form' || step === 'verify';

  return (
    <AuthLayout
      eyebrow="Free for everyone, forever"
      headline={
        <>
          Find trusted local pros <span className="text-gradient">in minutes.</span>
        </>
      }
      sub="Verified electricians, plumbers, drivers and more near you — call or WhatsApp them directly."
      benefits={[
        { icon: BadgeCheck, title: 'ID-verified professionals', body: 'Every listing is checked by our team before it goes live.' },
        { icon: Phone, title: 'Direct call or WhatsApp', body: 'No middleman, no booking fee, no commission.' },
        { icon: Star, title: 'Real reviews', body: 'Ratings from customers in your own city.' },
      ]}
      stats={[
        { value: `${categories.filter((c) => c.isActive).length}+`, label: 'Services' },
        { value: `${Math.floor(allCities.length / 50) * 50}+`, label: 'Cities' },
        { value: '₹0', label: 'Fees' },
      ]}
      footer={
        <div className="flex items-center justify-center gap-5 text-ink-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> ID-verified</span>
          <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> {t('reviews')}</span>
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> No middleman</span>
        </div>
      }
    >
      {showTabs && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-2 border border-line mb-6" role="tablist">
          {(['signup', 'signin'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`h-11 rounded-xl text-sm font-bold transition-all ${
                mode === m ? 'bg-surface-solid text-ink shadow-card border border-line' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {m === 'signup' ? 'Sign up' : 'Sign in'}
            </button>
          ))}
        </div>
      )}

      {/* Sign up, step 1: verify the number with phone.email */}
      {step === 'verify' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-ink">Create your account</h2>
            <p className="text-sm text-ink-3 mt-1">
              Verify your mobile number to begin. We'll send a one-time code.
            </p>
          </div>
          {errorText}
          <PhoneEmailButton onVerified={handleVerified('details')} disabled={isBusy} />
          {isBusy && <p className="text-sm text-ink-3 text-center">Confirming your number…</p>}
          <p className="text-[11px] text-ink-3 text-center">
            Your number is verified once. After that you sign in with a 4-digit PIN.
          </p>
        </div>
      )}

      {/* Sign up, step 2: name + PIN against the verified number */}
      {step === 'details' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          {backButton(() => { setStep('verify'); setVerification(null); setError(null); }, 'Use another number')}
          <div>
            <h2 className="text-2xl font-bold text-ink">Almost there</h2>
            <p className="text-sm text-ink-3 mt-1">Add your name and choose a 4-digit PIN.</p>
          </div>
          {verifiedBadge}
          <div>
            <label className="field-label" htmlFor="customer-name">Full name</label>
            <input
              id="customer-name"
              required
              autoFocus
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="input"
            />
          </div>
          <PinInput id="customer-pin" label="Choose a 4-digit PIN" value={pin} onChange={setPin} />
          <PinInput id="customer-pin-confirm" label="Re-enter PIN" value={confirmPin} onChange={setConfirmPin} />
          {errorText}
          <button type="submit" disabled={isBusy || !name.trim() || !pinsFilled} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isBusy ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-[11px] text-ink-3 text-center">Remember your PIN — you'll need it every time you sign in.</p>
        </form>
      )}

      {/* Sign in, and sign up when verification is switched off */}
      {step === 'form' && (
        <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
          <div className="pb-1">
            <h2 className="text-2xl font-bold text-ink">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="text-sm text-ink-3 mt-1">
              {mode === 'signup'
                ? 'Your name, mobile number and a 4-digit PIN you choose.'
                : 'Sign in with your mobile number and PIN.'}
            </p>
          </div>
          {mode === 'signup' && (
            <div>
              <label className="field-label" htmlFor="customer-name">Full name</label>
              <input
                id="customer-name"
                required
                autoFocus
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="input"
              />
            </div>
          )}
          <PhoneField id="customer-phone" value={phone} onChange={setPhone} autoFocus={mode === 'signin'} />
          <PinInput id="customer-pin" label={mode === 'signup' ? 'Choose a 4-digit PIN' : 'Your PIN'} value={pin} onChange={setPin} />
          {mode === 'signup' && (
            <PinInput id="customer-pin-confirm" label="Re-enter PIN" value={confirmPin} onChange={setConfirmPin} />
          )}
          {errorText}
          <button
            type="submit"
            disabled={
              isBusy || phone.length !== 10 || pin.length !== PIN_LENGTH ||
              (mode === 'signup' && (!name.trim() || confirmPin.length !== PIN_LENGTH))
            }
            className="btn btn-primary w-full h-[3.25rem] text-[15px]"
          >
            {isBusy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => { setStep('forgot'); setPin(''); setError(null); }}
              className="w-full text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
            >
              Forgot your PIN?
            </button>
          )}
        </form>
      )}

      {/* Forgot PIN: verify, then choose a new PIN */}
      {step === 'forgot' && (
        <div className="space-y-5">
          {backButton(() => { setStep('form'); setError(null); }, 'Back to sign in')}
          <div>
            <h2 className="text-2xl font-bold text-ink">Forgot your PIN?</h2>
            <p className="text-sm text-ink-3 mt-1">
              {VERIFY_ENABLED
                ? 'Verify your mobile number and choose a new PIN right away.'
                : "Confirm your number and our team will call you to verify, then reset it."}
            </p>
          </div>
          {errorText}
          {VERIFY_ENABLED ? (
            <>
              <PhoneEmailButton onVerified={handleVerified('forgotNewPin')} disabled={isBusy} />
              {isBusy && <p className="text-sm text-ink-3 text-center">Confirming your number…</p>}
            </>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <PhoneField id="forgot-phone" value={phone} onChange={setPhone} autoFocus />
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
            <h2 className="text-2xl font-bold text-ink">Choose a new PIN</h2>
            <p className="text-sm text-ink-3 mt-1">Pick a new 4-digit PIN for your account.</p>
          </div>
          {verifiedBadge}
          <PinInput id="new-pin" label="New PIN" value={pin} onChange={setPin} autoFocus />
          <PinInput id="new-pin-confirm" label="Re-enter new PIN" value={confirmPin} onChange={setConfirmPin} />
          {errorText}
          <button type="submit" disabled={isBusy || !pinsFilled} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
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
            <h2 className="text-2xl font-bold text-ink">Request received</h2>
            <p className="text-sm text-ink-3 mt-1.5">
              We'll call <span className="font-semibold text-ink">{typedPhone}</span> to confirm it's you, then clear your
              PIN so you can set a new one.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-surface-2 border border-line text-[13px] text-ink-2 text-left">
            <KeyRound className="w-4 h-4 shrink-0 mt-px text-accent-ink" />
            <p>Once it's cleared, tap <span className="font-bold text-ink">Sign up</span> with the same number to choose a new PIN.</p>
          </div>
          <button type="button" onClick={() => switchMode('signin')} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            Back to sign in
          </button>
        </div>
      )}
    </AuthLayout>
  );
};
