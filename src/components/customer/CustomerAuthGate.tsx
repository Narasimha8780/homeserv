import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';

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
        // Phone is verified but no account exists yet — just need a name to finish.
        setStep('needsName');
      }
      // If a customer came back, AppContext already logged them in — the gate unmounts.
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
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <h2 className="text-lg font-black flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            {mode === 'signup' ? 'Create your HomeServ account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {mode === 'signup'
              ? 'Just your name and mobile number — verified instantly with OTP.'
              : 'Sign in with your mobile number using OTP.'}
          </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="p-5 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  required
                  autoFocus={mode === 'signin'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full pl-9 text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}
            <button
              type="submit"
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-60"
            >
              {isBusy ? 'Sending...' : 'Send OTP'}
            </button>
            <p className="text-xs text-slate-500 text-center">
              {mode === 'signup' ? (
                <>Already have an account? <button type="button" onClick={() => switchMode('signin')} className="text-blue-600 font-bold">Sign In</button></>
              ) : (
                <>New here? <button type="button" onClick={() => switchMode('signup')} className="text-blue-600 font-bold">Sign Up</button></>
              )}
            </p>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerify} className="p-5 space-y-4">
            <button
              type="button"
              onClick={() => { setStep('form'); setCode(''); setMockOtp(null); setError(null); }}
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
              className="w-full text-center text-2xl font-black tracking-[0.5em] p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
            />

            {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-60"
            >
              {isBusy ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {step === 'needsName' && (
          <form onSubmit={handleCompleteSignup} className="p-5 space-y-4">
            <p className="text-xs text-slate-500">
              <span className="font-bold text-emerald-600">✓ Phone verified.</span> We couldn't find an account for{' '}
              <span className="font-bold text-slate-800">{phone}</span> — add your name to finish creating one.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            {error && <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>}
            <button
              type="submit"
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-60"
            >
              {isBusy ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
