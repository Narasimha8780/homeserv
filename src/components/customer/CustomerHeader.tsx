import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MapPin, ShieldCheck, MessageCircle, Star, Sparkles } from 'lucide-react';

export const CustomerHeader: React.FC<{ onOpenCityModal: () => void }> = ({ onOpenCityModal }) => {
  const { selectedCity, searchQuery, setSearchQuery, t } = useApp();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0a3a8f] via-[#1A73E8] to-[#0d5bc7] text-white pt-5 pb-7 px-4 sm:px-6 shadow-premium-lg">
      <div className="absolute inset-0 mesh-bg-blue opacity-60 pointer-events-none" />
      <div className="absolute -top-16 right-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 glass-surface bg-white/10 px-2.5 py-1 rounded-full text-xs text-orange-200 border border-white/15 mb-2">
              <Sparkles className="w-3 h-3 text-orange-300" />
              <span>{t('tierTag')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t('appName')}</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5">{t('tagline')}</p>
          </div>

          <button
            onClick={onOpenCityModal}
            className="self-start sm:self-auto flex items-center space-x-2 bg-white text-blue-900 px-3.5 py-2 rounded-2xl font-bold text-xs shadow-premium hover:shadow-premium-lg hover-lift transition-all border border-white/50"
          >
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>{selectedCity.name}, {selectedCity.state}</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Change</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-2 top-2 w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl shadow-premium-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-400/40 border border-white/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-blue-50 font-medium">
          <div className="flex items-center space-x-2 glass-surface bg-white/10 px-3 py-2 rounded-xl border border-white/15 hover:bg-white/15 transition-colors">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">{t('verifiedPros')}</span>
          </div>
          <div className="flex items-center space-x-2 glass-surface bg-white/10 px-3 py-2 rounded-xl border border-white/15 hover:bg-white/15 transition-colors">
            <MessageCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">{t('directContact')}</span>
          </div>
          <div className="flex items-center space-x-2 glass-surface bg-white/10 px-3 py-2 rounded-xl border border-white/15 hover:bg-white/15 transition-colors">
            <Star className="w-4 h-4 text-orange-300 shrink-0" />
            <span className="truncate">{t('realReviews')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
