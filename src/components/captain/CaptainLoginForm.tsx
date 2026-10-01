import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';

export const CaptainLoginForm: React.FC<{ onNewCaptain: (phone: string) => void }> = ({ onNewCaptain }) => {
  const { sendOtp, verifyOtp } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digitsOnly = (v: string) => v.replace(/\D/g, '');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digitsOnly(phone).length < 10 || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      const { mockOtp: otp } = await sendOtp(phone);
      setMockOtp(otp || null);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digitsOnly(code).length !== 6 || isVerifying) return;
    setIsVerifying(true);
    setError(null);
    try {
      const captain = await verifyOtp(phone, code);
      if (!captain) {
        onNewCaptain(phone.trim());
      }
      // If a captain was found, AppContext already logged them in — CaptainApp re-renders.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <h2 className="text-lg font-black flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Captain Login
          </h2>
          <p className="text-xs text-orange-100 mt-1">
            Verify your phone number with OTP to access your dashboard, or register as a new captain.
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full pl-9 text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-60"
            >
              {isSending ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="p-5 space-y-4">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode('');
                setMockOtp(null);
                setError(null);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Change number
            </button>

            <p className="text-xs text-slate-500">
              Enter the 6-digit code sent to <span className="font-bold text-slate-800">{phone}</span>
            </p>

            {mockOtp && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-bold">Demo mode — no real SMS sent.</span> Your OTP is{' '}
                  <span className="font-mono font-black tracking-widest">{mockOtp}</span>
                </p>
              </div>
            )}

            <input
              required
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(digitsOnly(e.target.value))}
              placeholder="000000"
              className="w-full text-center text-2xl font-black tracking-[0.5em] p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-orange-500"
            />

            {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-60"
            >
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
