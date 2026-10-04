import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OtpInput } from '../common/OtpInput';
import { User, Phone, Sparkles, ArrowLeft, ShieldCheck, Star, Users } from 'lucide-react';

type Mode = 'signup' | 'signin';
type Step = 'form' | 'otp' | 'needsName';

export const CustomerAuthGate: React.FC = () => {
  const { sendOtp, verifyCustomerOtp, completeCustomerSignup } = useApp();
  const [mode, setMode] = useState<Mode>('signup');
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digitsOnly = (v: string) => v.replace(/\D/g, '');

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep('form');
    setCode('');
    setMockOtp(null);
    setError(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digitsOnly(phone).length < 10 || (mode === 'signup' && !name.trim()) || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const { mockOtp: otp } = await sendOtp(phone);
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
    if (digitsOnly(code).length !== 6 || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const customer = await verifyCustomerOtp(phone, code, mode === 'signup' ? name.trim() : undefined);
      if (!customer && mode === 'signin') {
        setStep('needsName');
      }
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
      await completeCustomerSignup(name.trim(), phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Try again.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden bg-[#070b1a]">
      {/* Decorative mesh background */}
      <div className="absolute inset-0 mesh-bg-blue opacity-90" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] bg-indigo-600/25 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center font-black text-white shadow-[0_4px_20px_rgba(251,146,60,0.5)]">
            HS
          </div>
          <span className="font-black text-2xl text-white tracking-tight">HomeServ</span>
        </div>

        <div className="w-full bg-white rounded-[2rem] shadow-premium-lg border border-white/60 overflow-hidden">
          {/* Sign Up / Sign In segmented toggle */}
          <div className="p-2 pt-5 px-5">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === 'signup' ? 'bg-white text-blue-700 shadow-premium' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === 'signin' ? 'bg-white text-blue-700 shadow-premium' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="px-6 pb-2 pt-3 text-center">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signup'
                ? 'Just your name and mobile number — verified instantly with OTP.'
                : 'Sign in with your mobile number using OTP.'}
            </p>
          </div>

          {step === 'form' && (
            <form onSubmit={handleSendOtp} className="p-6 pt-3 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-1.5 top-1.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <input
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-12 text-sm py-3.5 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-1.5 top-1.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    required
                    autoFocus={mode === 'signin'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full pl-12 text-sm py-3.5 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}
              <button
                type="submit"
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_30px_-6px_rgba(37,99,235,0.6)] hover-lift active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isBusy ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerify} className="p-6 pt-3 space-y-5">
              <button
                type="button"
                onClick={() => { setStep('form'); setCode(''); setMockOtp(null); setError(null); }}
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

              <OtpInput value={code} onChange={setCode} autoFocus />

              {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}

              <button
                type="submit"
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_30px_-6px_rgba(37,99,235,0.6)] hover-lift active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isBusy ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}

          {step === 'needsName' && (
            <form onSubmit={handleCompleteSignup} className="p-6 pt-3 space-y-4">
              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800">
                  <span className="font-bold">Phone verified.</span> We couldn't find an account for{' '}
                  <span className="font-bold">{phone}</span> — add your name to finish creating one.
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute left-1.5 top-1.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-12 text-sm py-3.5 pr-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}
              <button
                type="submit"
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)] hover-lift active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isBusy ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-5 mt-6 text-zinc-300/80 text-[11px] font-medium">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> ID-Verified Pros</span>
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Real Reviews</span>
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> No Middleman</span>
        </div>
      </div>
    </div>
  );
};
