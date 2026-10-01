import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { CaptainCard } from './CaptainCard';
import { getCategoryIconUrl, ALL_CATEGORIES_ICON_URL } from '../../utils/categoryIcons';
import { Users } from 'lucide-react';

export const CaptainDirectory: React.FC<{ onOpenProfile: (captain: Captain) => void }> = ({ onOpenProfile }) => {
  const { categories, captains, searchQuery, selectedCity, t } = useApp();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const activeCategories = categories.filter((c) => c.isActive);

  const filteredCaptains = captains.filter((cap) => {
    if (cap.kycStatus !== 'verified') return false;
    if (cap.cityId !== selectedCity.id) return false;
    if (selectedCatId !== 'all' && !cap.categories.includes(selectedCatId as never)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const catTitles = cap.categories
        .map((id) => categories.find((c) => c.id === id)?.title || '')
        .join(' ')
        .toLowerCase();
      const matches =
        cap.name.toLowerCase().includes(q) ||
        catTitles.includes(q) ||
        cap.areas.some((a) => a.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  filteredCaptains.sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {t('allCategories')}
          </h2>
          <span className="text-xs text-blue-600 font-semibold">
            {activeCategories.length} categories
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all ${
              selectedCatId === 'all' ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white border border-slate-200 hover:border-blue-300'
            }`}
          >
            <img src={ALL_CATEGORIES_ICON_URL} alt="All" className="w-16 h-16 object-contain" />
            <span className="text-xs font-bold text-slate-800 text-center leading-tight">All</span>
          </button>

          {activeCategories.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all ${
                  isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white border border-slate-200 hover:border-blue-300'
                }`}
              >
                <img src={getCategoryIconUrl(cat.id)} alt={cat.title} className="w-16 h-16 object-contain" />
                <span className="text-xs font-bold text-slate-800 text-center leading-tight">{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {selectedCatId === 'all'
              ? `Top-rated in ${selectedCity.name}`
              : categories.find((c) => c.id === selectedCatId)?.title}
          </h2>
          <span className="text-xs text-slate-500">{filteredCaptains.length} listed</span>
        </div>

        {filteredCaptains.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">{t('noResults')}</h3>
            <p className="text-xs text-slate-500 mt-1">Try another category or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCaptains.map((cap) => (
              <CaptainCard key={cap.id} captain={cap} categories={categories} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
