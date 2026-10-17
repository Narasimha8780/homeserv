import React, { useEffect, useState } from 'react';
import { useApp, type AccountRole, type OtpPurpose, type PhoneVerification } from '../../context/AppContext';
import { OtpInput } from './OtpInput';
import { PhoneField, DemoOtpNotice } from './AuthLayout';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { formatIndianPhone } from '../../utils/format';
import { ArrowLeft } from 'lucide-react';

const CODE_LENGTH = 6;

// Two steps shared by sign-up, captain registration and forgot-PIN: send a code to
// the number on WhatsApp, then check it. On success the parent gets a server-issued
// verification token rather than the raw number.
export const PhoneOtpVerifier: React.FC<{
  purpose: OtpPurpose;
  role: AccountRole;
  onVerified: (verification: PhoneVerification) => void;
  initialPhone?: string;
  idPrefix?: string;
}> = ({ purpose, role, onVerified, initialPhone = '', idPrefix = 'otp' }) => {
  const { sendOtp, verifyOtpCode } = useApp();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, '').slice(-10));
  const [code, setCode] = useState('');
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = formatIndianPhone(phone);
  // OtpInput can leave a gap ("12 456") when a middle box is cleared.
  const digits = code.replace(/\D/g, '');

  // Counts down the resend cooldown the server enforces.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const requestCode = async () => {
    if (phone.length !== 10 || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const result = await sendOtp(fullPhone, purpose, role);
      setMockOtp(result.mockOtp || null);
      setResendIn(result.resendAfter ?? 60);
      setCode('');
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    requestCode();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.length !== CODE_LENGTH || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      onVerified(await verifyOtpCode(fullPhone, digits));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the code. Please try again.');
      setCode('');
    } finally {
      setIsBusy(false);
    }
  };

  const errorText = error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>;

  if (step === 'phone') {
    return (
      <form onSubmit={handleSend} className="space-y-4">
        <PhoneField id={`${idPrefix}-phone`} value={phone} onChange={setPhone} autoFocus />
        {errorText}
        <button type="submit" disabled={isBusy || phone.length !== 10} className="btn btn-whatsapp w-full h-[3.25rem] text-[15px]">
          <WhatsAppIcon className="w-5 h-5" />
          {isBusy ? 'Sending…' : 'Send code on WhatsApp'}
        </button>
        <p className="text-[11px] text-ink-3 text-center">We'll send a 6-digit code to this number on WhatsApp.</p>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <button
        type="button"
        onClick={() => {
          setStep('phone');
          setCode('');
          setMockOtp(null);
          setError(null);
        }}
        className="btn btn-ghost h-9 pl-1.5 pr-3 -ml-1.5 text-[13px]"
      >
        <ArrowLeft className="w-4 h-4" /> Change number
      </button>
      <p className="text-sm text-ink-3">
        Enter the 6-digit code we sent on WhatsApp to <span className="font-semibold text-ink">{fullPhone}</span>
      </p>
      {mockOtp && <DemoOtpNotice code={mockOtp} />}
      <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} autoFocus />
      {errorText}
      <button type="submit" disabled={isBusy || digits.length !== CODE_LENGTH} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
        {isBusy ? 'Verifying…' : 'Verify code'}
      </button>
      <p className="text-[13px] text-ink-3 text-center">
        Didn't get it?{' '}
        {resendIn > 0 ? (
          <span>Resend in {resendIn}s</span>
        ) : (
          <button type="button" onClick={requestCode} disabled={isBusy} className="font-semibold text-accent-ink hover:underline">
            Resend code
          </button>
        )}
      </p>
    </form>
  );
};
