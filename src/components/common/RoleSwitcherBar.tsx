import React from 'react';
import { useApp } from '../../context/AppContext';
import type { AppLanguage } from '../../types';
import { Smartphone, Wrench, ShieldCheck, Globe, RotateCcw, MapPin } from 'lucide-react';

export const RoleSwitcherBar: React.FC<{ onOpenCityModal: () => void }> = ({ onOpenCityModal }) => {
  const { role, setRole, language, setLanguage, selectedCity, resetToDefault, currentCaptain } = useApp();

  const languages: { code: AppLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0D47A1] text-white shadow-md border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-white shadow-sm">
              HS
            </div>
            <span className="font-extrabold text-lg tracking-tight">HomeServ</span>
          </div>

          <button
            onClick={onOpenCityModal}
            className="flex items-center space-x-1.5 bg-blue-950/60 hover:bg-blue-900 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-700/50 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold">{selectedCity.name}</span>
          </button>
        </div>

        <div className="flex items-center bg-blue-950/80 p-1 rounded-xl border border-blue-800/80">
          <button
            onClick={() => setRole('customer')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'customer' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' : 'text-blue-200 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>I Need a Service</span>
          </button>

          <button
            onClick={() => setRole('captain')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'captain' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm' : 'text-blue-200 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{currentCaptain ? `Captain (${currentCaptain.name.split(' ')[0]})` : "I'm a Captain"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRole('admin')}
            title="Admin console"
            className={`p-1.5 rounded-lg border transition-colors ${
              role === 'admin' ? 'bg-emerald-700 border-emerald-500 text-white' : 'bg-blue-950/60 border-blue-800 text-blue-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 absolute left-2 text-blue-300 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              aria-label="Select Language"
              className="bg-blue-950/90 text-white text-xs pl-7 pr-2 py-1 rounded-lg border border-blue-700/50 appearance-none focus:outline-none focus:ring-1 focus:ring-orange-400 cursor-pointer"
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
            className="p-1.5 bg-blue-950/60 hover:bg-red-900/60 text-blue-200 hover:text-white rounded-lg border border-blue-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
