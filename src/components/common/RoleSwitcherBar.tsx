import React from 'react';
import { useApp } from '../../context/AppContext';
import type { AppLanguage } from '../../types';
import { Smartphone, Wrench, Globe, RotateCcw, MapPin, ChevronDown } from 'lucide-react';

export const RoleSwitcherBar: React.FC<{ onOpenCityModal: () => void }> = ({ onOpenCityModal }) => {
  const { role, setRole, setCustomerTab, setSelectedCategoryId, language, setLanguage, selectedCity, resetToDefault, currentCaptain } = useApp();

  const goHome = () => {
    setRole('customer');
    setCustomerTab('home');
    setSelectedCategoryId(null);
  };

  const languages: { code: AppLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0a3a8f] via-[#0D47A1] to-[#153e91] text-white shadow-premium-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <button onClick={goHome} className="flex items-center space-x-2 group" title="Go to home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center font-black text-white shadow-[0_2px_10px_rgba(251,146,60,0.5)] group-hover:scale-105 group-hover:shadow-[0_4px_16px_rgba(251,146,60,0.6)] transition-all duration-200">
              HS
            </div>
            <span className="font-extrabold text-lg tracking-tight group-hover:text-orange-200 transition-colors">HomeServ</span>
          </button>

          <button
            onClick={onOpenCityModal}
            className="flex items-center space-x-1.5 glass-surface bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 transition-colors shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-300" />
            <span className="font-semibold">{selectedCity.name}</span>
            <ChevronDown className="w-3 h-3 text-blue-200" />
          </button>
        </div>

        <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setRole('customer')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              role === 'customer'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_2px_10px_rgba(59,130,246,0.5)]'
                : 'text-blue-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>I Need a Service</span>
          </button>

          <button
            onClick={() => setRole('captain')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              role === 'captain'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_10px_rgba(249,115,22,0.5)]'
                : 'text-blue-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{currentCaptain ? `Captain (${currentCaptain.name.split(' ')[0]})` : "I'm a Captain"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 absolute left-2.5 text-blue-300 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              aria-label="Select Language"
              className="bg-white/10 hover:bg-white/15 text-white text-xs pl-7 pr-2 py-1.5 rounded-lg border border-white/15 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-400/60 cursor-pointer transition-colors"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetToDefault}
            title="Reset Language & Favorites"
            className="p-1.5 bg-white/10 hover:bg-rose-500/30 text-blue-200 hover:text-white rounded-lg border border-white/15 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
