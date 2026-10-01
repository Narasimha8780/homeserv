import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, MapPin, ShieldCheck, MessageCircle, Star, Sparkles } from 'lucide-react';

export const CustomerHeader: React.FC<{ onOpenCityModal: () => void }> = ({ onOpenCityModal }) => {
  const { selectedCity, searchQuery, setSearchQuery, t } = useApp();

  return (
    <div className="bg-gradient-to-b from-[#0D47A1] via-[#1A73E8] to-[#1565C0] text-white pt-3 pb-6 px-4 sm:px-6 shadow-inner">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs text-orange-200 border border-white/20 mb-1">
              <Sparkles className="w-3 h-3 text-orange-300" />
              <span>{t('tierTag')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t('appName')}</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">{t('tagline')}</p>
          </div>

          <button
            onClick={onOpenCityModal}
            className="self-start sm:self-auto flex items-center space-x-2 bg-white text-blue-900 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md hover:bg-orange-50 transition-all border border-orange-200"
          >
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>{selectedCity.name}, {selectedCity.state}</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Change</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl shadow-lg text-sm font-medium focus:outline-none focus:ring-3 focus:ring-orange-400 border border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-blue-100">
          <div className="flex items-center space-x-1.5 bg-blue-900/40 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-blue-400/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">{t('verifiedPros')}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-blue-900/40 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-blue-400/20">
            <MessageCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">{t('directContact')}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-blue-900/40 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-blue-400/20">
            <Star className="w-4 h-4 text-orange-300 shrink-0" />
            <span className="truncate">{t('realReviews')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
