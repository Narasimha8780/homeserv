import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OtpInput } from '../common/OtpInput';
import { AuthLayout, DemoOtpNotice, PhoneField } from '../common/AuthLayout';
import { formatIndianPhone } from '../../utils/format';
import { ArrowLeft, BadgeCheck, Star, Phone, ShieldCheck, Users } from 'lucide-react';

type Mode = 'signup' | 'signin';
type Step = 'form' | 'otp' | 'needsName';

export const CustomerAuthGate: React.FC = () => {
  const { sendOtp, verifyCustomerOtp, completeCustomerSignup, categories, allCities, t } = useApp();
  const [mode, setMode] = useState<Mode>('signup');
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = formatIndianPhone(phone);

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep('form');
    setCode('');
    setMockOtp(null);
    setError(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || (mode === 'signup' && !name.trim()) || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const { mockOtp: otp } = await sendOtp(fullPhone);
      setMockOtp(otp || null);
      setCode('');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.replace(/\D/g, '').length !== 6 || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const customer = await verifyCustomerOtp(fullPhone, code, mode === 'signup' ? name.trim() : undefined);
      if (!customer && mode === 'signin') setStep('needsName');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      await completeCustomerSignup(name.trim(), fullPhone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const nameField = (
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
  );

  const errorText = error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>;

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
      {step === 'form' && (
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

      {step === 'form' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="pb-1">
            <h2 className="text-2xl font-bold text-ink">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="text-sm text-ink-3 mt-1">
              {mode === 'signup' ? 'Just your name and mobile number — verified with OTP.' : 'Sign in with your mobile number using OTP.'}
            </p>
          </div>
          {mode === 'signup' && nameField}
          <PhoneField id="customer-phone" value={phone} onChange={setPhone} autoFocus={mode === 'signin'} />
          {errorText}
          <button type="submit" disabled={isBusy || phone.length < 10 || (mode === 'signup' && !name.trim())} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isBusy ? 'Sending…' : 'Send OTP'}
          </button>
          <p className="text-[11px] text-ink-3 text-center">By continuing you agree to be contacted about your account by SMS.</p>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerify} className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setCode('');
              setMockOtp(null);
              setError(null);
            }}
            className="btn btn-ghost h-9 pl-1.5 pr-3 -ml-1.5 text-[13px]"
          >
            <ArrowLeft className="w-4 h-4" /> Change number
          </button>
          <div>
            <h2 className="text-2xl font-bold text-ink">Enter the code</h2>
            <p className="text-sm text-ink-3 mt-1">
              We sent a 6-digit code to <span className="font-semibold text-ink">{fullPhone}</span>
            </p>
          </div>
          {mockOtp && <DemoOtpNotice code={mockOtp} />}
          <OtpInput value={code} onChange={setCode} autoFocus />
          {errorText}
          <button type="submit" disabled={isBusy || code.replace(/\D/g, '').length !== 6} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isBusy ? 'Verifying…' : 'Verify & continue'}
          </button>
        </form>
      )}

      {step === 'needsName' && (
        <form onSubmit={handleCompleteSignup} className="space-y-4">
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-success-soft text-success-ink text-[13px]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-px" />
            <p>
              <span className="font-bold">Phone verified.</span> We couldn't find an account for {fullPhone} — add your name to finish.
            </p>
          </div>
          {nameField}
          {errorText}
          <button type="submit" disabled={isBusy || !name.trim()} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isBusy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
