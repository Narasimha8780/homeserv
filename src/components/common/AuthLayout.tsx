import React, { type ReactNode } from 'react';
import { LogoMark } from '../ui/Logo';
import { HomeBrand } from '../ui/HomeBrand';
import { Sparkles } from 'lucide-react';

export interface AuthBenefit {
  icon: React.ElementType;
  title: string;
  body: string;
}

// Split marketing + form layout shared by the customer and captain sign-in screens.
// Phones get a compact brand header above the form card.
export const AuthLayout: React.FC<{
  variant?: 'default' | 'captain';
  eyebrow: string;
  headline: ReactNode;
  sub: string;
  benefits: AuthBenefit[];
  stats?: { value: string; label: string }[];
  children: ReactNode;
  footer?: ReactNode;
}> = ({ variant = 'default', eyebrow, headline, sub, benefits, stats, children, footer }) => (
  <div className={`auth-layout ${variant === 'captain' ? 'captain-auth' : ''} relative min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] grid lg:grid-cols-[1.1fr_1fr] max-w-7xl mx-auto`}>
    <aside className="hidden lg:flex flex-col justify-center px-12 xl:px-16 py-16">
      <span className="inline-flex items-center gap-1.5 self-start pill bg-accent-soft text-accent-ink !py-1 !px-3">
        <Sparkles className="w-3.5 h-3.5" /> {eyebrow}
      </span>
      <h1 className="mt-6 text-5xl xl:text-6xl font-bold text-ink leading-[1.05]">{headline}</h1>
      <p className="mt-5 text-lg text-ink-2 max-w-lg leading-relaxed">{sub}</p>
      <ul className="mt-10 space-y-5 max-w-lg">
        {benefits.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <span className="w-12 h-12 rounded-2xl bg-surface-2 border border-line text-accent-ink flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold text-ink">{title}</span>
              <span className="block text-[15px] text-ink-3 mt-0.5">{body}</span>
            </span>
          </li>
        ))}
      </ul>
      {stats && (
        <div className="mt-12 flex gap-10">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
              <div className="text-sm text-ink-3 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </aside>

    <main className="min-w-0 flex items-center justify-center px-4 py-8 sm:py-14">
      <div className="w-full min-w-0 max-w-md animate-page-enter">
        <div className="lg:hidden text-center mb-7">
          {variant === 'captain' ? <HomeBrand /> : <LogoMark className="w-14 h-14 mx-auto" />}
          <h1 className="mt-5 text-[1.85rem] sm:text-4xl font-bold text-ink leading-tight">{headline}</h1>
          <p className="mt-2 text-[15px] text-ink-2">{sub}</p>
        </div>
        <div className="card !bg-surface-solid !rounded-[2rem] p-5 sm:p-8 shadow-pop">{children}</div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </main>
  </div>
);

export const PhoneField: React.FC<{
  id: string;
  value: string;
  onChange: (digits: string) => void;
  autoFocus?: boolean;
  label?: string;
}> = ({ id, value, onChange, autoFocus, label = 'Mobile number' }) => (
  <div>
    <label className="field-label" htmlFor={id}>{label}</label>
    <div className="flex items-stretch rounded-2xl bg-surface-2 border border-line focus-within:border-accent/75 focus-within:shadow-[0_0_0_4px_var(--accent-soft)] transition-all">
      <span className="flex items-center gap-1.5 pl-4 pr-3 text-[15px] font-semibold text-ink-2 border-r border-line">
        <span aria-hidden="true">🇮🇳</span> +91
      </span>
      <input
        id={id}
        required
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        autoFocus={autoFocus}
        maxLength={10}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        placeholder="98765 43210"
        className="flex-1 min-w-0 bg-transparent px-3.5 h-12 text-[17px] font-semibold tracking-wide text-ink outline-none"
      />
    </div>
  </div>
);

export const DemoOtpNotice: React.FC<{ code: string }> = ({ code }) => (
  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-warn-soft text-warn-ink text-[13px]">
    <Sparkles className="w-4 h-4 shrink-0 mt-px" />
    <p>
      <span className="font-bold">Demo mode — no WhatsApp message sent.</span> Your code is{' '}
      <span className="font-display font-bold tracking-[0.2em] text-[15px]">{code}</span>
    </p>
  </div>
);
