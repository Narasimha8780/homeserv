import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { pushBackHandler } from '../../utils/backStack';
import type { AppLanguage } from '../../types';
import { Home, Heart, Globe, HelpCircle, LogOut, User, Briefcase, ChevronDown, X, ShieldCheck } from 'lucide-react';

const LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
];

const FAQS = [
  { q: 'How does HomeServ work?', a: 'We list verified local plumbers, electricians, drivers and other professionals with their direct contact number. You call or WhatsApp them yourself — HomeServ does not handle bookings or payments.' },
  { q: 'Are these professionals verified?', a: 'Captains marked "Verified" have submitted an ID document that our team has checked before their listing goes live.' },
  { q: 'How do I trust who to call?', a: 'Check their rating, read reviews from other customers, and confirm details directly on the call before agreeing to any work or price.' },
];

const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(
    () => pushBackHandler(() => { closeRef.current(); return true; }),
    []
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[1.75rem] w-full max-w-md shadow-premium-lg overflow-hidden border border-white/60 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden p-5 bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="absolute inset-0 mesh-bg-blue opacity-40 pointer-events-none" />
          <h3 className="relative font-black text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help &amp; Support
          </h3>
          <button onClick={onClose} className="relative p-1.5 rounded-full hover:bg-white/20" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto custom-scrollbar">
          {FAQS.map((f) => (
            <div key={f.q} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-sm font-bold text-slate-900">{f.q}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.a}</p>
            </div>
          ))}
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            HomeServ is a directory only — we don't handle bookings or payments.
          </p>
        </div>
      </div>
    </div>
  );
};

// One menu used in two places: the permanent left sidebar (desktop/tablet) and the
// slide-in drawer (phones / the Android app).
export const CustomerMenu: React.FC<{ showNav?: boolean; onClose?: () => void }> = ({ showNav = true, onClose }) => {
  const {
    customerTab, setCustomerTab, setSelectedCategoryId, setSearchQuery,
    language, setLanguage, currentCustomer, signOutCustomer, setRole, t,
  } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const NAV = [
    { id: 'home' as const, label: t('home'), icon: Home },
    { id: 'favorites' as const, label: t('myFavorites'), icon: Heart },
  ];

  const itemBase =
    'w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left';
  const itemIdle = 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:shadow-premium';
  const currentLanguage = LANGUAGES.find((l) => l.code === language)?.label ?? 'English';

  return (
    <div className="flex flex-col gap-1.5">
      {currentCustomer && (
        <div className="flex items-center gap-3 p-3 mb-1.5 bg-white rounded-2xl border border-slate-200/70 shadow-premium">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-premium">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{currentCustomer.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentCustomer.phone}</p>
          </div>
        </div>
      )}

      {showNav &&
        NAV.map((item) => {
          const Icon = item.icon;
          const active = customerTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCustomerTab(item.id);
                setSearchQuery('');
                if (item.id === 'home') setSelectedCategoryId(null);
                onClose?.();
              }}
              className={`${itemBase} ${active ? 'bg-blue-600 text-white shadow-md' : itemIdle}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

      <div className="my-1.5 h-px bg-slate-200/80" />

      <div>
        <button onClick={() => setLangOpen((o) => !o)} className={`${itemBase} ${itemIdle} justify-between`}>
          <span className="flex items-center gap-2.5 min-w-0">
            <Globe className="w-4 h-4 shrink-0 text-blue-600" />
            <span className="truncate">Language</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0">
            {currentLanguage}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {langOpen && (
          <div className="grid grid-cols-2 gap-1.5 mt-1.5 p-2 bg-white rounded-2xl border border-slate-200/70 shadow-premium">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  language === l.code
                    ? 'border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)]'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setHelpOpen(true)} className={`${itemBase} ${itemIdle}`}>
        <HelpCircle className="w-4 h-4 shrink-0 text-blue-600" />
        <span>Help &amp; Support</span>
      </button>

      <button
        onClick={() => {
          setRole('captain');
          onClose?.();
        }}
        className="relative overflow-hidden w-full flex items-center gap-2.5 px-4 py-3 mt-1 rounded-xl text-left text-white bg-gradient-to-br from-orange-500 to-amber-600 shadow-premium hover-lift transition-all"
      >
        <div className="absolute inset-0 mesh-bg-amber opacity-40 pointer-events-none" />
        <Briefcase className="relative w-4 h-4 shrink-0" />
        <span className="relative">
          <span className="block text-sm font-black leading-tight">List your service</span>
          <span className="block text-[10px] text-orange-100 font-medium">Plumber, electrician, driver…</span>
        </span>
      </button>

      <button
        onClick={() => {
          signOutCustomer();
          onClose?.();
        }}
        className={`${itemBase} mt-1 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50`}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span>Sign Out</span>
      </button>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </div>
  );
};
