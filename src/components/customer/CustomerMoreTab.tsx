import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, HelpCircle, ChevronRight, RotateCcw, ShieldCheck, Briefcase } from 'lucide-react';
import type { AppLanguage } from '../../types';

export const CustomerMoreTab: React.FC<{ onBecomeCaptain: () => void }> = ({ onBecomeCaptain }) => {
  const { language, setLanguage, resetToDefault } = useApp();
  const [showHelp, setShowHelp] = useState(false);

  const languages: { code: AppLanguage; label: string }[] = [
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <button
        onClick={onBecomeCaptain}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between text-left"
      >
        <div>
          <h3 className="font-black text-base flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Are you a plumber, electrician or driver?
          </h3>
          <p className="text-xs text-orange-100 mt-1">List your service for free and get found by local customers.</p>
        </div>
        <ChevronRight className="w-5 h-5 shrink-0" />
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2 mb-3">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>App Language</span>
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                language === l.code
                  ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-400'
                  : 'border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <button onClick={() => setShowHelp(!showHelp)} className="w-full p-4 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Help &amp; Support</span>
          </h3>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showHelp ? 'rotate-90' : ''}`} />
        </button>
        {showHelp && (
          <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-3.5">
                <p className="text-xs font-bold text-slate-900">{f.q}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={resetToDefault}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs bg-white hover:bg-slate-50 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset Demo Data</span>
      </button>

      <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 pt-2">
        <ShieldCheck className="w-3 h-3" />
        <span>HomeServ is a directory only — we don't handle bookings or payments.</span>
      </div>
    </div>
  );
};
