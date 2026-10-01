import React from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { CaptainCard } from './CaptainCard';
import { Heart } from 'lucide-react';

export const CustomerFavoritesTab: React.FC<{ onOpenProfile: (captain: Captain) => void }> = ({ onOpenProfile }) => {
  const { captains, favorites, categories, t } = useApp();

  const favoriteCaptains = captains.filter((c) => favorites.includes(c.id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('myFavorites')}</h2>
        <p className="text-xs text-slate-500">Professionals you've saved for quick access later</p>
      </div>

      {favoriteCaptains.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-premium">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7 text-rose-300" />
          </div>
          <h3 className="font-bold text-slate-700 text-base">No favorites saved yet</h3>
          <p className="text-xs text-slate-400 mt-1">Tap the heart icon on any profile to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteCaptains.map((cap) => (
            <CaptainCard key={cap.id} captain={cap} categories={categories} onOpenProfile={onOpenProfile} />
          ))}
        </div>
      )}
    </div>
  );
};
