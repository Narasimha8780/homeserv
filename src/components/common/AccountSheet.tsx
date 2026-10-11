import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { AppTheme } from '../../types';
import { LANGUAGES } from '../../i18n/languages';
import { Sheet, SheetBody, SheetHeader } from '../ui/Sheet';
import { Avatar } from '../ui/Avatar';
import { LogoMark } from '../ui/Logo';
import {
  Heart, CircleHelp, LogOut, Briefcase, ChevronRight, Sun, Moon, Monitor, Search, ShieldCheck, RotateCcw, Globe, Palette,
} from 'lucide-react';

const FAQS = [
  { q: 'How does HomeServ work?', a: 'We list verified local plumbers, electricians, drivers and other professionals with their direct contact number. You call or WhatsApp them yourself — HomeServ does not handle bookings or payments.' },
  { q: 'Are these professionals verified?', a: 'Captains marked "Verified" have submitted an ID document that our team has checked before their listing goes live.' },
  { q: 'How do I trust who to call?', a: 'Check their rating, read reviews from other customers, and confirm details directly on the call before agreeing to any work or price.' },
  { q: 'Is HomeServ free?', a: 'Yes — free for customers, and free for professionals to list their service. We never take a commission.' },
];

const HelpSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useApp();
  return (
    <Sheet open={open} onClose={onClose} label={t('help')}>
      <SheetHeader title={t('help')} subtitle="Answers to common questions" icon={<CircleHelp className="w-5 h-5" />} onClose={onClose} />
      <SheetBody className="px-5 pb-[calc(1.25rem+var(--sa-bottom))] space-y-2.5">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-2xl bg-surface-2 border border-line open:bg-surface-3/60">
            <summary className="flex items-center justify-between gap-3 p-4 text-sm font-semibold text-ink list-none cursor-pointer">
              {f.q}
              <ChevronRight className="w-4 h-4 text-ink-3 shrink-0 transition-transform group-open:rotate-90" />
            </summary>
            <p className="px-4 pb-4 -mt-1 text-[13px] text-ink-2 leading-relaxed">{f.a}</p>
          </details>
        ))}
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-3 pt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          HomeServ is a directory only — we don't handle bookings or payments.
        </p>
        <p className="text-center text-[11px] text-ink-3 leading-relaxed">
          Place names: Local Government Directory, Govt. of India. Map locations derived from DataMeet (CC BY 2.5 IN)
          and GeoNames (CC BY) data.
        </p>
      </SheetBody>
    </Sheet>
  );
};

const Row: React.FC<{ icon: React.ReactNode; label: string; hint?: React.ReactNode; onClick: () => void; danger?: boolean }> = ({
  icon, label, hint, onClick, danger,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-colors hover:bg-surface-2 ${
      danger ? 'text-danger-ink' : 'text-ink'
    }`}
  >
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-danger-soft' : 'bg-surface-2 text-ink-2'}`}>
      {icon}
    </span>
    <span className="flex-1 text-[15px] font-semibold">{label}</span>
    {hint}
    {!danger && <ChevronRight className="w-4 h-4 text-ink-3" />}
  </button>
);

// Account & settings — bottom sheet on phones, right-hand drawer on desktop.
export const AccountSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const {
    role, setRole, setCustomerTab, setSelectedCategoryId, setSearchQuery, language, setLanguage, theme, setTheme,
    currentCustomer, signOutCustomer, currentCaptain, setActiveCaptainId, favorites, resetToDefault, t,
  } = useApp();
  const [helpOpen, setHelpOpen] = useState(false);

  const THEMES: { id: AppTheme; label: string; icon: React.ElementType }[] = [
    { id: 'dark', label: t('themeDark'), icon: Moon },
    { id: 'light', label: t('themeLight'), icon: Sun },
    { id: 'system', label: t('themeSystem'), icon: Monitor },
  ];

  const profile =
    role === 'captain' && currentCaptain
      ? { name: currentCaptain.name, sub: currentCaptain.phone, avatar: currentCaptain.avatar, tag: 'Captain' }
      : currentCustomer
      ? { name: currentCustomer.name, sub: currentCustomer.phone, avatar: undefined, tag: 'Customer' }
      : null;

  const go = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} label={t('account')} placement="right">
      <SheetBody className="px-4 pt-6 pb-[calc(1.5rem+var(--sa-bottom))]">
        {/* Profile */}
        <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-gradient-to-br from-orange-500/15 via-transparent to-transparent border border-line">
          {profile ? (
            <Avatar src={profile.avatar} name={profile.name} className="w-14 h-14 rounded-2xl" textClassName="text-lg" />
          ) : (
            <LogoMark className="w-14 h-14" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold text-ink truncate">{profile ? profile.name : 'Welcome to HomeServ'}</p>
            <p className="text-[13px] text-ink-3 truncate">{profile ? profile.sub : t('tagline')}</p>
          </div>
          {profile && <span className="pill bg-accent-soft text-accent-ink">{profile.tag}</span>}
        </div>

        {/* Quick links */}
        <div className="mt-3 space-y-0.5">
          {role === 'customer' && currentCustomer && (
            <Row
              icon={<Heart className="w-[18px] h-[18px]" />}
              label={t('myFavorites')}
              hint={<span className="text-[13px] font-semibold text-ink-3">{favorites.length}</span>}
              onClick={() => go(() => { setCustomerTab('favorites'); setSearchQuery(''); })}
            />
          )}
          <Row icon={<CircleHelp className="w-[18px] h-[18px]" />} label={t('help')} onClick={() => setHelpOpen(true)} />
        </div>

        {/* Language */}
        <section className="mt-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3 px-1 mb-2.5">
            <Globe className="w-3.5 h-3.5" /> {t('language')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                aria-pressed={language === l.code}
                className="chip justify-center flex-col !gap-0 !py-2 !rounded-2xl"
              >
                <span className="text-sm">{l.label}</span>
                <span className="text-[10px] font-medium opacity-70">{l.english}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="mt-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3 px-1 mb-2.5">
            <Palette className="w-3.5 h-3.5" /> {t('appearance')}
          </h3>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-surface-2 border border-line" role="radiogroup" aria-label={t('appearance')}>
            {THEMES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="radio"
                aria-checked={theme === id}
                onClick={() => setTheme(id)}
                className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-[13px] font-semibold transition-all ${
                  theme === id ? 'bg-surface-solid text-ink shadow-card border border-line' : 'text-ink-3 hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Role switch promo */}
        {role === 'customer' ? (
          <button
            onClick={() => go(() => setRole('captain'))}
            className="mt-5 w-full flex items-center gap-3.5 p-4 rounded-3xl text-left bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-[0_14px_30px_-14px_rgba(255,122,26,0.9)] active:scale-[0.98] transition-transform"
          >
            <span className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-display font-bold text-base leading-tight">{t('listService')}</span>
              <span className="block text-xs text-white/85 mt-0.5">{t('listServiceSub')}</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        ) : (
          <div className="mt-5 space-y-0.5">
            <Row
              icon={<Search className="w-[18px] h-[18px]" />}
              label={t('findServices')}
              onClick={() => go(() => { setRole('customer'); setCustomerTab('home'); setSelectedCategoryId(null); })}
            />
          </div>
        )}

        {/* Sign out / reset */}
        <div className="mt-4 pt-3 border-t border-line space-y-0.5">
          {role === 'captain' && currentCaptain && (
            <Row danger icon={<LogOut className="w-[18px] h-[18px]" />} label={`${t('signOut')} (Captain)`} onClick={() => go(() => setActiveCaptainId(null))} />
          )}
          {role === 'customer' && currentCustomer && (
            <Row danger icon={<LogOut className="w-[18px] h-[18px]" />} label={t('signOut')} onClick={() => go(signOutCustomer)} />
          )}
          <button
            onClick={() => {
              if (window.confirm('Reset HomeServ on this device? This signs you out and clears saved professionals, language and theme.')) {
                go(resetToDefault);
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-ink-3 hover:text-ink-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset app data on this device
          </button>
        </div>

        <p className="mt-2 text-center text-[11px] text-ink-3">HomeServ · Free local services directory</p>
      </SheetBody>
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </Sheet>
  );
};
