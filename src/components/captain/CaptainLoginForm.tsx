import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OtpInput } from '../common/OtpInput';
import { Phone, ShieldCheck, Sparkles, ArrowLeft, Wrench } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-56px)] relative flex items-center justify-center px-4 py-10 overflow-hidden bg-[#140a05]">
      <div className="absolute inset-0 mesh-bg-amber opacity-90" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] bg-amber-600/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.5)]">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl text-white tracking-tight">Captain Portal</span>
        </div>

        <div className="w-full bg-white rounded-[2rem] shadow-premium-lg border border-white/60 overflow-hidden">
          <div className="px-6 pt-6 pb-2 text-center">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
              Captain Login
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify your phone with OTP to access your dashboard, or register as a new captain.
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="p-6 pt-3 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-1.5 top-1.5 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-orange-600" />
                  </div>
                  <input
                    required
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full pl-12 text-sm py-3.5 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}
              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-[0_8px_24px_-6px_rgba(234,88,12,0.5)] hover:shadow-[0_10px_30px_-6px_rgba(234,88,12,0.6)] hover-lift active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isSending ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="p-6 pt-3 space-y-5">
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

              <p className="text-xs text-slate-500 text-center">
                Enter the 6-digit code sent to <span className="font-bold text-slate-800">{phone}</span>
              </p>

              {mockOtp && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">Demo mode — no real SMS sent.</span> Your OTP is{' '}
                    <span className="font-mono font-black tracking-widest">{mockOtp}</span>
                  </p>
                </div>
              )}

              <OtpInput value={code} onChange={setCode} accent="orange" autoFocus />

              {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-[0_8px_24px_-6px_rgba(234,88,12,0.5)] hover:shadow-[0_10px_30px_-6px_rgba(234,88,12,0.6)] hover-lift active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
