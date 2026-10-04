import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { CaptainCard } from './CaptainCard';
import { ALL_CATEGORIES_ICON_URL } from '../../utils/categoryIcons';
import { CategoryIcon } from '../common/CategoryIcon';
import { ArrowLeft, Search, Users, MapPin, ShieldCheck } from 'lucide-react';

type SortKey = 'rating' | 'experience' | 'price';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Top rated' },
  { key: 'experience', label: 'Most experienced' },
  { key: 'price', label: 'Lowest price' },
];

export const CaptainDirectory: React.FC<{ onOpenProfile: (captain: Captain) => void }> = ({ onOpenProfile }) => {
  const { categories, captains, searchQuery, setSearchQuery, selectedCity, selectedCategoryId, setSelectedCategoryId, t } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('rating');

  const activeCategories = categories.filter((c) => c.isActive);
  const openCategory = (id: string) => {
    setSearchQuery('');
    setSortKey('rating');
    setSelectedCategoryId(id);
    window.history.pushState({ homeservCat: id }, '');
    window.scrollTo({ top: 0 });
  };

  const goBack = () => {
    if (window.history.state?.homeservCat) window.history.back();
    else setSelectedCategoryId(null);
  };

  // Keep the browser / Android back button in sync with the in-app category page.
  useEffect(() => {
    if (!selectedCategoryId && window.history.state?.homeservCat) window.history.replaceState(null, '');
    const onPop = (e: PopStateEvent) => {
      setSearchQuery('');
      setSelectedCategoryId(e.state?.homeservCat ?? null);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matchesSearch = (cap: Captain) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const catTitles = cap.categories
      .map((id) => categories.find((c) => c.id === id)?.title || '')
      .join(' ')
      .toLowerCase();
    return cap.name.toLowerCase().includes(q) || catTitles.includes(q) || cap.areas.some((a) => a.toLowerCase().includes(q));
  };

  const inCity = useMemo(
    () => captains.filter((cap) => cap.kycStatus === 'verified' && cap.cityId === selectedCity.id),
    [captains, selectedCity.id]
  );

  // ----- Category page -----
  if (selectedCategoryId) {
    const isAll = selectedCategoryId === 'all';
    const category = categories.find((c) => c.id === selectedCategoryId);
    const title = isAll ? 'All Professionals' : category?.title || 'Category';

    const list = inCity
      .filter((cap) => isAll || cap.categories.includes(selectedCategoryId as never))
      .filter(matchesSearch)
      .sort((a, b) => {
        if (sortKey === 'experience') return b.experienceYears - a.experienceYears;
        if (sortKey === 'price') return (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity);
        return b.rating - a.rating;
      });

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5 animate-page-enter">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-premium hover:shadow-premium-lg hover-lift text-sm font-bold text-slate-800 transition-all"
        >
          <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </span>
          Back
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a3a8f] via-[#1A73E8] to-[#0d5bc7] text-white p-5 shadow-premium-lg">
          <div className="absolute inset-0 mesh-bg-blue opacity-60 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="shrink-0 rounded-2xl bg-white p-1.5 shadow-premium">
              {isAll ? (
                <img src={ALL_CATEGORIES_ICON_URL} alt="All" className="w-16 h-16 object-cover rounded-2xl" />
              ) : (
                <CategoryIcon
                  categoryId={selectedCategoryId}
                  title={title}
                  iconName={category?.iconName || ''}
                  colorClass={category?.color || 'from-slate-500 to-slate-700'}
                />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight leading-tight">{title}</h1>
              <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">
                {isAll ? 'Every verified professional near you' : category?.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  {list.length} {list.length === 1 ? 'professional' : 'professionals'}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-orange-300" />
                  {selectedCity.name}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  ID-verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${isAll ? 'by name or area' : `${title.toLowerCase()} by name or area`}...`}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-xs"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  sortKey === opt.key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)]'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-premium">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{t('noResults')}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'Try a different search.'
                : `No ${isAll ? 'professionals' : title.toLowerCase()} listed in ${selectedCity.name} yet — try another city or check back soon.`}
            </p>
            <button
              onClick={goBack}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              Browse other categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((cap) => (
              <CaptainCard key={cap.id} captain={cap} categories={categories} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----- Home: category grid + top rated -----
  const topRated = inCity.filter(matchesSearch).sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-7">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{t('allCategories')}</h2>
          <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-full">
            {activeCategories.length} categories
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          <button
            onClick={() => openCategory('all')}
            className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-premium transition-all duration-200 hover-lift"
          >
            <img src={ALL_CATEGORIES_ICON_URL} alt="All" className="w-16 h-16 object-cover rounded-2xl transition-transform duration-200 group-hover:scale-105" />
            <span className="text-xs font-bold text-slate-800 text-center leading-tight">All</span>
          </button>

          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => openCategory(cat.id)}
              className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-premium transition-all duration-200 hover-lift"
            >
              <span className="transition-transform duration-200 group-hover:scale-105">
                <CategoryIcon categoryId={cat.id} title={cat.title} iconName={cat.iconName} colorClass={cat.color} />
              </span>
              <span className="text-xs font-bold text-slate-800 text-center leading-tight">{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Top-rated in {selectedCity.name}</h2>
          <span className="text-xs text-slate-500 font-semibold">{topRated.length} listed</span>
        </div>

        {topRated.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-premium">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{t('noResults')}</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRated.map((cap) => (
              <CaptainCard key={cap.id} captain={cap} categories={categories} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
