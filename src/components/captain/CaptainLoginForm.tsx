import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OtpInput } from '../common/OtpInput';
import { AuthLayout, DemoOtpNotice, PhoneField } from '../common/AuthLayout';
import { formatIndianPhone } from '../../utils/format';
import { ArrowLeft, IndianRupee, Phone, BadgeCheck, Wrench } from 'lucide-react';

export const CaptainLoginForm: React.FC<{ onNewCaptain: (phone: string) => void }> = ({ onNewCaptain }) => {
  const { sendOtp, verifyOtp } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = formatIndianPhone(phone);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      const { mockOtp: otp } = await sendOtp(fullPhone);
      setMockOtp(otp || null);
      setCode('');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.replace(/\D/g, '').length !== 6 || isVerifying) return;
    setIsVerifying(true);
    setError(null);
    try {
      const captain = await verifyOtp(fullPhone, code);
      // If a captain was found, AppContext already logged them in — CaptainApp re-renders.
      if (!captain) onNewCaptain(fullPhone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP. Try again.');
    } finally {
      setIsVerifying(false);
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

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <p className="text-sm text-ink-3 -mt-2">
            New or returning — verify your number with OTP. New captains go straight to a 2-minute sign-up.
          </p>
          <PhoneField id="captain-phone" value={phone} onChange={setPhone} autoFocus />
          {error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>}
          <button type="submit" disabled={isSending || phone.length < 10} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isSending ? 'Sending…' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setCode('');
              setMockOtp(null);
              setError(null);
            }}
            className="btn btn-ghost h-9 pl-1.5 pr-3 -ml-1.5 -mt-2 text-[13px]"
          >
            <ArrowLeft className="w-4 h-4" /> Change number
          </button>
          <p className="text-sm text-ink-3">
            Enter the 6-digit code sent to <span className="font-semibold text-ink">{fullPhone}</span>
          </p>
          {mockOtp && <DemoOtpNotice code={mockOtp} />}
          <OtpInput value={code} onChange={setCode} autoFocus />
          {error && <p className="text-sm text-danger-ink font-semibold text-center">{error}</p>}
          <button type="submit" disabled={isVerifying || code.replace(/\D/g, '').length !== 6} className="btn btn-primary w-full h-[3.25rem] text-[15px]">
            {isVerifying ? 'Verifying…' : 'Verify & continue'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
