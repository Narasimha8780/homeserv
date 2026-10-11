import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { CaptainGrid } from './CaptainCard';
import { CategoryIcon } from '../common/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { matchesQuery } from '../../utils/search';
import { useLocalCaptains } from '../../hooks/useLocalCaptains';
import { ALL_CATEGORIES_ICON_URL } from '../../utils/categoryIcons';
import { ArrowLeft, Search, X, Users, MapPin, BadgeCheck } from 'lucide-react';

type SortKey = 'rating' | 'experience' | 'price';

export const CategoryView: React.FC<{
  categoryId: string;
  onBack: () => void;
  onOpenProfile: (captain: Captain) => void;
}> = ({ categoryId, onBack, onOpenProfile }) => {
  const { categories, searchQuery, setSearchQuery, selectedCity, selectedPlace, t } = useApp();
  const areaName = selectedPlace ? selectedPlace.subdistrict.name : selectedCity.name;
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [availableOnly, setAvailableOnly] = useState(false);

  const isAll = categoryId === 'all';
  const category = categories.find((c) => c.id === categoryId);
  const title = isAll ? 'All Professionals' : category?.title || 'Category';
  const categoryTitle = (id: string) => categories.find((c) => c.id === id)?.title || '';

  // Mandal first, then the rest of the district (or the city when no place is chosen).
  const { tiers } = useLocalCaptains();
  const q = searchQuery.trim().toLowerCase();
  const inCat = (cap: Captain) => isAll || cap.categories.includes(categoryId as never);
  const sortFn = (a: Captain, b: Captain) => {
    if (sortKey === 'experience') return b.experienceYears - a.experienceYears;
    if (sortKey === 'price') return (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity);
    return b.rating - a.rating;
  };
  const inCategory = tiers.flatMap((tier) => tier.captains.filter(inCat));
  const shownTiers = tiers
    .map((tier) => ({
      ...tier,
      captains: tier.captains
        .filter(inCat)
        .filter((cap) => matchesQuery(cap, q, categoryTitle))
        .filter((cap) => !availableOnly || cap.isAvailable)
        .sort(sortFn),
    }))
    .filter((tier) => tier.captains.length);
  const list = shownTiers.flatMap((tier) => tier.captains);

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'rating', label: t('sortTopRated') },
    { key: 'experience', label: t('sortExperience') },
    { key: 'price', label: t('sortPrice') },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 animate-page-enter">
      <button onClick={onBack} className="btn btn-ghost h-10 pl-2 pr-4 -ml-2 text-[15px]">
        <ArrowLeft className="w-5 h-5" />
        {t('back')}
      </button>

      <header className="mt-3 relative overflow-hidden rounded-[1.75rem] border border-line bg-gradient-to-br from-orange-500/18 via-surface to-surface p-5 sm:p-7">
        <div className="absolute -right-10 -top-14 w-52 h-52 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4 sm:gap-5">
          {isAll ? (
            <img src={ALL_CATEGORIES_ICON_URL} alt="" className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-[24%] object-cover shadow-card" />
          ) : (
            <CategoryIcon
              categoryId={categoryId}
              title={title}
              iconName={category?.iconName || ''}
              colorClass={category?.color || 'from-slate-500 to-slate-700'}
              className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 shadow-card"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-[1.65rem] sm:text-4xl font-bold text-ink leading-tight">{title}</h1>
            <p className="text-sm text-ink-2 mt-1 line-clamp-2">{isAll ? 'Every verified professional near you' : category?.tagline}</p>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="pill bg-surface-solid/60 border border-line">
            <Users className="w-3.5 h-3.5" /> {inCategory.length} {t('pros')}
          </span>
          <span className="pill bg-surface-solid/60 border border-line">
            <MapPin className="w-3.5 h-3.5 text-accent" /> {areaName}
          </span>
          <span className="pill bg-surface-solid/60 border border-line">
            <BadgeCheck className="w-3.5 h-3.5 text-info-ink" /> {t('verified')}
          </span>
        </div>
      </header>

      <div className="mt-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1" role="search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-3 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${isAll ? 'by name or area' : `${title.toLowerCase()}s by name or area`}…`}
            className="input !pl-12 !pr-11 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="icon-btn w-8 h-8 absolute right-2.5 top-1/2 -translate-y-1/2" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          <button onClick={() => setAvailableOnly((v) => !v)} aria-pressed={availableOnly} className="chip">
            <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-success' : 'bg-ink-3'}`} />
            {t('availableOnly')}
          </button>
          <span className="w-px bg-line my-1.5 shrink-0" aria-hidden="true" />
          {SORTS.map((s) => (
            <button key={s.key} onClick={() => setSortKey(s.key)} aria-pressed={sortKey === s.key} className="chip">
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {list.length > 0 ? (
          shownTiers.length > 1 || shownTiers[0]?.id !== 'city' ? (
            shownTiers.map((tier, i) => (
              <div key={tier.id} className={i ? 'mt-8' : ''}>
                <h2 className="text-lg font-bold text-ink">
                  {tier.title} <span className="text-ink-3 font-semibold">({tier.captains.length})</span>
                </h2>
                {tier.subtitle && <p className="mb-3 text-[13px] text-ink-3">{tier.subtitle}</p>}
                <CaptainGrid captains={tier.captains} categories={categories} onOpenProfile={onOpenProfile} />
              </div>
            ))
          ) : (
            <CaptainGrid captains={list} categories={categories} onOpenProfile={onOpenProfile} />
          )
        ) : (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title={t('noResults')}
            body={
              q || availableOnly
                ? t('noMatchBody')
                : `No ${isAll ? 'professionals' : title.toLowerCase() + 's'} listed in ${selectedPlace ? `${selectedPlace.district.name} district` : selectedCity.name} yet — try another city or check back soon.`
            }
            action={
              <button onClick={onBack} className="btn btn-secondary h-11 px-5">
                Browse other categories
              </button>
            }
          />
        )}
      </div>
    </div>
  );
};
