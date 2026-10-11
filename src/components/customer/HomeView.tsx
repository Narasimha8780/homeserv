import React, { useMemo } from 'react';
import { usePopularCities } from '../../hooks/usePopularCities';
import { matchesQuery } from '../../utils/search';
import { useApp } from '../../context/AppContext';
import type { Captain, City } from '../../types';
import { CaptainGrid } from './CaptainCard';
import { CategoryIcon } from '../common/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { Avatar } from '../ui/Avatar';
import { ALL_CATEGORIES_ICON_URL } from '../../utils/categoryIcons';
import { firstName } from '../../utils/format';
import { distanceLabel, NEARBY_RADIUS_KM } from '../../utils/nearby';
import { MapPin, Search, X, BadgeCheck, Phone, Star, ChevronRight, Briefcase, SearchX, MapPinOff, IndianRupee } from 'lucide-react';

export const SectionHeader: React.FC<{ title: React.ReactNode; meta?: React.ReactNode }> = ({ title, meta }) => (
  <div className="flex items-end justify-between gap-3 mb-4">
    <h2 className="text-xl sm:text-2xl font-bold text-ink">{title}</h2>
    {meta && <span className="text-[13px] font-semibold text-ink-3 shrink-0 pb-0.5">{meta}</span>}
  </div>
);

const CategoryTile: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button onClick={onClick} className="group flex flex-col items-center gap-2 text-center outline-none">
    <span className="rounded-[24%] shadow-card ring-1 ring-line transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-accent">
      {children}
    </span>
    <span className="text-[13px] font-semibold text-ink-2 group-hover:text-ink leading-tight line-clamp-2 min-h-[2.4em]">
      {label}
    </span>
  </button>
);

export const HomeView: React.FC<{
  onOpenCategory: (id: string) => void;
  onOpenProfile: (captain: Captain) => void;
  onOpenCity: () => void;
}> = ({ onOpenCategory, onOpenProfile, onOpenCity }) => {
  const { categories, captains, searchQuery, setSearchQuery, selectedCity, setSelectedCity, selectedPlace, currentCustomer, setRole, t } = useApp();
  const placeName = selectedPlace ? selectedPlace.village?.name || selectedPlace.subdistrict.name : selectedCity.name;
  const servedBy = selectedPlace?.servedBy?.cityId === selectedCity.id ? selectedPlace.servedBy : null;
  const popularCities = usePopularCities();

  const activeCategories = categories.filter((c) => c.isActive);
  const categoryTitle = (id: string) => categories.find((c) => c.id === id)?.title || '';

  const inCity = useMemo(
    () => captains.filter((cap) => cap.kycStatus === 'verified' && cap.cityId === selectedCity.id),
    [captains, selectedCity.id]
  );
  const q = searchQuery.trim().toLowerCase();
  const results = q ? inCity.filter((cap) => matchesQuery(cap, q, categoryTitle)).sort((a, b) => b.rating - a.rating) : [];
  const matchingCategories = q ? activeCategories.filter((c) => c.title.toLowerCase().includes(q)) : [];
  const topRated = [...inCity].sort((a, b) => b.rating - a.rating);
  const availableCount = inCity.filter((c) => c.isAvailable).length;
  const availableNow = topRated.filter((c) => c.isAvailable).slice(0, 4);

  const [titleBefore, titleAfter = ''] = t('heroTitle').split('{city}');

  const cityChips = (cities: { city: City; count: number }[]) => (
    <div className="flex flex-wrap justify-center gap-2">
      {cities
        .filter(({ city }) => city.id !== selectedCity.id)
        .map(({ city, count }) => (
          <button key={city.id} onClick={() => setSelectedCity(city)} className="chip">
            {city.name}
            <span className="text-ink-3 font-medium">{count}</span>
          </button>
        ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 animate-page-enter">
      {/* Hero */}
      <section className="pt-6 sm:pt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12 lg:items-center">
        <div className="min-w-0">
        {currentCustomer && (
          <p className="text-[15px] font-semibold text-ink-2">
            {t('greeting')}, {firstName(currentCustomer.name)} <span aria-hidden="true">👋</span>
          </p>
        )}
        <h1 className="mt-1.5 text-[2rem] leading-[1.1] sm:text-5xl sm:leading-[1.05] font-bold text-ink max-w-3xl">
          {titleBefore}
          <button
            onClick={onOpenCity}
            className="text-gradient underline decoration-dotted decoration-2 underline-offset-[0.18em] decoration-orange-400/60 hover:decoration-orange-400"
          >
            {placeName}
          </button>
          {titleAfter}
        </h1>
        {selectedPlace && (
          <p className="mt-2 text-[13px] text-ink-3 leading-relaxed">
            <MapPin className="inline w-3.5 h-3.5 text-accent -mt-0.5 mr-1" />
            {[selectedPlace.village?.name, selectedPlace.subdistrict.name, selectedPlace.district.name].filter(Boolean).join(', ')}
            {servedBy && servedBy.cityName !== placeName && (
              <>
                {' '}· showing pros from <span className="font-semibold text-ink-2">{servedBy.cityName}</span> ({servedBy.sameDistrict && servedBy.distanceKm > NEARBY_RADIUS_KM ? 'in your district' : distanceLabel(servedBy.distanceKm)})
              </>
            )}
          </p>
        )}
        <p className="mt-3 text-[15px] sm:text-lg text-ink-2 max-w-2xl leading-relaxed">{t('heroSubtitle')}</p>

        <div className="mt-5 sm:mt-7 relative max-w-2xl" role="search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-3 pointer-events-none" />
          <input
            type="search"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="input !min-h-14 !pl-12 !pr-12 !rounded-[1.25rem] !bg-surface-solid shadow-card [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="icon-btn w-8 h-8 absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar lg:flex-wrap lg:overflow-visible">
          {availableCount > 0 && (
            <span className="chip !text-success-ink !bg-success-soft !border-transparent">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-70" />
                <span className="relative w-2 h-2 rounded-full bg-success" />
              </span>
              {availableCount} {t('availableOnly').toLowerCase()}
            </span>
          )}
          <span className="chip">
            <BadgeCheck className="w-4 h-4 text-info-ink" /> {t('verifiedPros')}
          </span>
          <span className="chip">
            <Phone className="w-4 h-4 text-success-ink" /> {t('directContact')}
          </span>
          <span className="chip">
            <Star className="w-4 h-4 fill-star text-star" /> {t('realReviews')}
          </span>
        </div>
        </div>

        {availableNow.length > 0 && (
          <aside className="hidden lg:block card !bg-surface-solid/70 glass p-5 shadow-pop">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-success" />
                </span>
                {t('availableOnly')}
              </h2>
              <span className="text-xs font-semibold text-ink-3">{selectedCity.name}</span>
            </div>
            <ul className="mt-3 -mx-2">
              {availableNow.map((cap) => (
                <li key={cap.id}>
                  <button
                    onClick={() => onOpenProfile(cap)}
                    className="w-full flex items-center gap-3 p-2 rounded-2xl text-left hover:bg-surface-2 transition-colors"
                  >
                    <Avatar src={cap.avatar} name={cap.name} className="w-11 h-11 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                        <span className="truncate">{cap.name}</span>
                        <BadgeCheck className="w-4 h-4 text-info-ink shrink-0" />
                      </span>
                      <span className="block text-xs text-ink-3 truncate">
                        {categoryTitle(cap.categories[0])} · {cap.areas[0]}
                      </span>
                    </span>
                    {cap.rating > 0 && (
                      <span className="flex items-center gap-1 text-[13px] font-bold text-ink">
                        <Star className="w-3.5 h-3.5 fill-star text-star" />
                        {cap.rating.toFixed(1)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-ink-3" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 pt-3 border-t border-line text-xs text-ink-3">Tap a pro to read reviews and call them directly.</p>
          </aside>
        )}
      </section>

      {q ? (
        <section className="mt-8 sm:mt-10">
          <SectionHeader title={t('resultsFor', { query: searchQuery.trim() })} meta={`${results.length} ${t('pros')}`} />
          {matchingCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {matchingCategories.map((c) => (
                <button key={c.id} onClick={() => onOpenCategory(c.id)} className="chip !pl-1.5">
                  <CategoryIcon categoryId={c.id} title={c.title} iconName={c.iconName} colorClass={c.color} className="w-6 h-6" iconClassName="w-3.5 h-3.5" />
                  {c.title}
                  <ChevronRight className="w-4 h-4 text-ink-3" />
                </button>
              ))}
            </div>
          )}
          {results.length > 0 ? (
            <CaptainGrid captains={results} categories={categories} onOpenProfile={onOpenProfile} />
          ) : (
            <EmptyState icon={<SearchX className="w-7 h-7" />} title={t('noMatch')} body={t('noMatchBody')} />
          )}
        </section>
      ) : (
        <>
          <section className="mt-9 sm:mt-12">
            <SectionHeader title={t('allCategories')} />
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-x-3 gap-y-4 sm:gap-x-4">
              <CategoryTile label="All" onClick={() => onOpenCategory('all')}>
                <img src={ALL_CATEGORIES_ICON_URL} alt="" className="w-[4.25rem] h-[4.25rem] sm:w-[4.5rem] sm:h-[4.5rem] object-cover rounded-[24%]" />
              </CategoryTile>
              {activeCategories.map((cat) => (
                <CategoryTile key={cat.id} label={cat.title} onClick={() => onOpenCategory(cat.id)}>
                  <CategoryIcon
                    categoryId={cat.id}
                    title={cat.title}
                    iconName={cat.iconName}
                    colorClass={cat.color}
                    className="w-[4.25rem] h-[4.25rem] sm:w-[4.5rem] sm:h-[4.5rem]"
                  />
                </CategoryTile>
              ))}
            </div>
          </section>

          <section className="mt-10 sm:mt-14">
            <SectionHeader title={t('topRatedIn', { city: selectedCity.name })} meta={`${topRated.length} ${t('pros')}`} />
            {topRated.length > 0 ? (
              <CaptainGrid captains={topRated} categories={categories} onOpenProfile={onOpenProfile} />
            ) : (
              <EmptyState
                icon={<MapPinOff className="w-7 h-7" />}
                tone="accent"
                title={t('emptyCity', { city: selectedCity.name })}
                body={t('emptyCityBody')}
                action={popularCities.length > 0 ? cityChips(popularCities) : undefined}
              />
            )}
          </section>

          {/* Supply-side growth: invite professionals to list for free */}
          <section className="mt-10 sm:mt-14 relative overflow-hidden rounded-[1.75rem] border border-line bg-gradient-to-br from-orange-500/20 via-amber-400/10 to-transparent p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shadow-[0_12px_28px_-10px_rgba(255,122,26,0.9)] shrink-0">
                <Briefcase className="w-7 h-7" />
              </span>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-ink">{t('listService')}</h3>
                <p className="mt-1 text-sm sm:text-[15px] text-ink-2 max-w-xl">{t('listServiceSub')}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-ink-2">
                  <span className="pill"><IndianRupee className="w-3.5 h-3.5" /> 0% commission</span>
                  <span className="pill"><BadgeCheck className="w-3.5 h-3.5" /> Verified badge</span>
                  <span className="pill"><Phone className="w-3.5 h-3.5" /> Direct customer calls</span>
                </div>
              </div>
              <button onClick={() => setRole('captain')} className="btn btn-primary h-12 px-6 self-start sm:self-center">
                {t('getStarted')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
