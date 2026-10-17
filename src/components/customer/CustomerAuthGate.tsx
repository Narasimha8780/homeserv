import React, { useState } from 'react';
import { useApp, type PhoneVerification } from '../../context/AppContext';
import { AuthLayout, PhoneField } from '../common/AuthLayout';
import { PinInput, PIN_LENGTH } from '../common/PinInput';
import { PhoneOtpVerifier } from '../common/PhoneOtpVerifier';
import { NewPinSheet } from '../common/NewPinSheet';
import { formatIndianPhone } from '../../utils/format';
import { ArrowLeft, BadgeCheck, Star, Phone, ShieldCheck, Users } from 'lucide-react';

type Mode = 'signup' | 'signin';
// signup: verify → details.  signin: form, or forgot → (verify) → new-PIN pop-up.
type Step = 'verify' | 'details' | 'signin' | 'forgot';

export const CustomerAuthGate: React.FC = () => {
  const { signUpCustomer, signInCustomer, resetPinWithVerification, categories, allCities, t } = useApp();

  const [mode, setMode] = useState<Mode>('signup');
  const [step, setStep] = useState<Step>('verify');
  const [verification, setVerification] = useState<PhoneVerification | null>(null);
  const [resetVerification, setResetVerification] = useState<PhoneVerification | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped to remount the verifier so it starts over at the phone step.
  const [verifierKey, setVerifierKey] = useState(0);

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep(next === 'signup' ? 'verify' : 'signin');
    setVerification(null);
    setPin('');
    setConfirmPin('');
    setError(null);
    setVerifierKey((k) => k + 1);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy || !verification) return;
    if (pin !== confirmPin) {
      setError('Both PINs must match.');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      await signUpCustomer(name.trim(), pin, verification.verificationToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create your account. Try again.';
      setError(message);
      setPin('');
      setConfirmPin('');
      // The token is spent once the server has used it, so verify again.
      if (/verif/i.test(message)) {
        setVerification(null);
        setStep('verify');
        setVerifierKey((k) => k + 1);
      }
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
      await signInCustomer(formatIndianPhone(phone), pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Try again.');
      setPin('');
    } finally {
      setIsBusy(false);
    }
  };

  const errorText = error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>;
  const showTabs = step === 'verify' || step === 'signin';

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

      {/* Sign up, step 1: verify the number on WhatsApp */}
      {step === 'verify' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Create your account</h2>
            <p className="text-sm text-ink-3 mt-1">Start with your mobile number. We'll verify it on WhatsApp.</p>
          </div>
          <PhoneOtpVerifier
            key={verifierKey}
            purpose="signup"
            role="customer"
            idPrefix="signup"
            onVerified={(v) => {
              setVerification(v);
              setError(null);
              setStep('details');
            }}
          />
        </div>
      )}

      {/* Sign up, step 2: name + PIN for the verified number */}
      {step === 'details' && verification && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Almost there</h2>
            <p className="text-sm text-ink-3 mt-1">Add your name and choose a 4-digit PIN.</p>
          </div>
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-success-soft text-success-ink text-[13px]">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            <p>
              <span className="font-bold">{formatIndianPhone(verification.phone)}</span> verified
            </p>
          </div>
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
          <PinInput id="customer-pin-confirm" label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} />
          {errorText}
          <button
            type="submit"
            disabled={isBusy || !name.trim() || pin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH}
            className="btn btn-primary w-full h-[3.25rem] text-[15px]"
          >
            {isBusy ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-[11px] text-ink-3 text-center">You'll sign in with your number and this PIN from now on.</p>
        </form>
      )}

      {/* Sign in: phone + PIN */}
      {step === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="pb-1">
            <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
            <p className="text-sm text-ink-3 mt-1">Sign in with your mobile number and PIN.</p>
          </div>
          <PhoneField id="customer-phone" value={phone} onChange={setPhone} autoFocus />
          <PinInput id="customer-pin" label="Your PIN" value={pin} onChange={setPin} />
          {errorText}
          <button
            type="submit"
            disabled={isBusy || phone.length !== 10 || pin.length !== PIN_LENGTH}
            className="btn btn-primary w-full h-[3.25rem] text-[15px]"
          >
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
        </form>
      )}

      {/* Forgot PIN: verify on WhatsApp, then the new-PIN pop-up opens */}
      {step === 'forgot' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setStep('signin');
              setError(null);
            }}
            className="btn btn-ghost h-9 pl-1.5 pr-3 -ml-1.5 text-[13px]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </button>
          <div>
            <h2 className="text-2xl font-bold text-ink">Forgot your PIN?</h2>
            <p className="text-sm text-ink-3 mt-1">Verify your number on WhatsApp, then choose a new PIN.</p>
          </div>
          <PhoneOtpVerifier
            key={verifierKey}
            purpose="reset"
            role="customer"
            idPrefix="forgot"
            initialPhone={phone}
            onVerified={setResetVerification}
          />
        </div>
      )}

      <NewPinSheet
        open={!!resetVerification}
        verifiedPhone={resetVerification?.phone ?? ''}
        onSubmit={async (newPin) => {
          // Signs the customer straight in — they just proved they hold the number.
          await resetPinWithVerification(resetVerification!.verificationToken, newPin, 'customer');
          setResetVerification(null);
        }}
        onClose={() => {
          // The token can't be reused, so closing means verifying again.
          setResetVerification(null);
          setVerifierKey((k) => k + 1);
        }}
      />
    </AuthLayout>
  );
};
