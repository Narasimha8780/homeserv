import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Clock3, XCircle, FileText, UserPlus, Eye, Check, X, Lock } from 'lucide-react';

type StepState = 'done' | 'current' | 'failed' | 'todo';

export const CaptainKycTab: React.FC = () => {
  const { currentCaptain, t } = useApp();
  if (!currentCaptain) return null;
  const status = currentCaptain.kycStatus;

  const meta = {
    verified: { label: t('kycStatusVerified'), body: 'Your ID has been verified. Your profile is visible to customers in your city.', cls: 'bg-success-soft text-success-ink', icon: ShieldCheck },
    pending: { label: t('kycStatusPending'), body: 'Our team typically reviews new listings within 24–48 hours.', cls: 'bg-warn-soft text-warn-ink', icon: Clock3 },
    rejected: { label: 'Rejected — action needed', body: 'Please contact support to re-submit your ID document.', cls: 'bg-danger-soft text-danger-ink', icon: XCircle },
  }[status];

  const STEPS: { title: string; body: string; icon: React.ElementType; state: StepState }[] = [
    { title: 'Registered', body: 'Your listing details were submitted.', icon: UserPlus, state: 'done' },
    { title: 'ID document submitted', body: 'Aadhaar / government ID on file.', icon: FileText, state: currentCaptain.aadhaarMasked ? 'done' : 'current' },
    {
      title: 'Team review',
      body: status === 'rejected' ? 'We could not verify your ID.' : 'We check your ID matches your details.',
      icon: ShieldCheck,
      state: status === 'verified' ? 'done' : status === 'rejected' ? 'failed' : 'current',
    },
    { title: 'Live to customers', body: 'Customers in your city can find and call you.', icon: Eye, state: status === 'verified' ? 'done' : 'todo' },
  ];

  const dot: Record<StepState, string> = {
    done: 'bg-success text-white',
    current: 'bg-warn text-white ring-4 ring-warn/20',
    failed: 'bg-danger text-white',
    todo: 'bg-surface-3 text-ink-3',
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 items-start">
      <div className="space-y-4">
        <div className={`rounded-3xl p-5 flex items-center gap-4 ${meta.cls}`}>
          <span className="w-12 h-12 rounded-2xl bg-surface-solid/60 flex items-center justify-center shrink-0">
            <meta.icon className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-base font-bold">{meta.label}</h2>
            <p className="text-[13px] opacity-90 mt-0.5">{meta.body}</p>
          </div>
        </div>

        <section className="card p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink">
            <FileText className="w-4 h-4 text-accent" /> Aadhaar / ID document
          </h3>
          <div className="mt-4 flex items-center gap-4">
            {currentCaptain.aadhaarDocUrl ? (
              <img src={currentCaptain.aadhaarDocUrl} alt="ID document" className="w-24 h-16 rounded-xl object-cover border border-line" />
            ) : (
              <div className="w-24 h-16 rounded-xl bg-surface-2 border border-dashed border-line-strong flex items-center justify-center text-ink-3">
                <FileText className="w-6 h-6" />
              </div>
            )}
            <div>
              <p className="text-xs text-ink-3">ID number</p>
              <p className="font-mono text-base font-bold text-ink tracking-wider">{currentCaptain.aadhaarMasked}</p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-3">
            <Lock className="w-3.5 h-3.5" /> Only the last 4 digits are stored and shown. Customers never see your ID.
          </p>
        </section>
      </div>

      <section className="card p-5">
        <h3 className="text-base font-bold text-ink mb-4">Verification progress</h3>
        <ol>
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {i < STEPS.length - 1 && (
                <span className={`absolute left-[15px] top-9 bottom-1 w-0.5 rounded-full ${step.state === 'done' ? 'bg-success/50' : 'bg-line-strong'}`} />
              )}
              <span className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dot[step.state]}`}>
                {step.state === 'done' ? <Check className="w-4 h-4" /> : step.state === 'failed' ? <X className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </span>
              <div className="pt-1">
                <p className={`text-[15px] font-semibold ${step.state === 'todo' ? 'text-ink-3' : 'text-ink'}`}>{step.title}</p>
                <p className="text-[13px] text-ink-3 mt-0.5">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
