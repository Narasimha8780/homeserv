import React, { useMemo } from 'react';
import { usePopularCities } from '../../hooks/usePopularCities';
import { matchesQuery } from '../../utils/search';
import { useApp } from '../../context/AppContext';
import type { Captain, City } from '../../types';
import { CaptainGrid } from './CaptainCard';
import { CategoryIcon } from '../common/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { ALL_CATEGORIES_ICON_URL } from '../../utils/categoryIcons';
import { getRootCategories } from '../../utils/categoryHierarchy';
import { getServiceSubcategories } from '../../data/serviceSubcategories';
import { getServiceTagline } from '../../utils/serviceTaglines';
import { firstName } from '../../utils/format';
import { Search, X, BadgeCheck, Phone, Star, ChevronRight, ArrowUpRight, Briefcase, SearchX, MapPin, MapPinOff, House, Check, ArrowRight } from 'lucide-react';

export const SectionHeader: React.FC<{ title: React.ReactNode; meta?: React.ReactNode }> = ({ title, meta }) => (
  <div className="flex items-end justify-between gap-3 mb-5">
    <h2 className="text-xl sm:text-2xl font-bold text-ink">{title}</h2>
    {meta && <span className="text-[13px] font-semibold text-ink-3 shrink-0 pb-0.5">{meta}</span>}
  </div>
);

export const HomeView: React.FC<{
  onOpenCategory: (id: string) => void;
  onOpenProfile: (captain: Captain) => void;
  onOpenCity: () => void;
}> = ({ onOpenCategory, onOpenProfile, onOpenCity }) => {
  const { categories, captains, searchQuery, setSearchQuery, selectedCity, setSelectedCity, currentCustomer, setRole, t } = useApp();
  const popularCities = usePopularCities();
  const activeCategories = getRootCategories(categories).filter((c) => c.isActive);
  const categoryTitle = (id: string) => categories.find((c) => c.id === id)?.title || '';
  const inCity = useMemo(
    () => captains.filter((cap) => cap.kycStatus === 'verified' && cap.cityId === selectedCity.id),
    [captains, selectedCity.id]
  );
  const q = searchQuery.trim().toLowerCase();
  const results = q ? inCity.filter((cap) => matchesQuery(cap, q, categoryTitle)).sort((a, b) => b.rating - a.rating) : [];
  const matchingCategories = q ? activeCategories.filter((c) => c.title.toLowerCase().includes(q) || getServiceSubcategories(c.id, c.title).some((service) => service.title.toLowerCase().includes(q))) : [];
  const topRated = [...inCity].sort((a, b) => b.rating - a.rating);
  const availableCount = inCity.filter((c) => c.isAvailable).length;

  const cityChips = (cities: { city: City; count: number }[]) => (
    <div className="flex flex-wrap justify-center gap-2">
      {cities.filter(({ city }) => city.id !== selectedCity.id).map(({ city, count }) => (
        <button key={city.id} onClick={() => setSelectedCity(city)} className="chip">
          {city.name}<span className="text-ink-3 font-medium">{count}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="home-dashboard max-w-6xl mx-auto px-4 sm:px-6 animate-page-enter">
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="min-w-0 relative z-10">
          <p className="home-eyebrow">{currentCustomer ? `${t('greeting')}, ${firstName(currentCustomer.name)}` : t('dashboardWelcome')}</p>
          <h1 id="home-heading" className="home-headline">{t('dashboardHeroStart')}<br /><span>{t('dashboardHeroEnd')}</span></h1>
          <p className="mt-4 text-[15px] sm:text-lg text-ink-2 leading-relaxed max-w-lg">{t('dashboardIntro')}</p>
          <button onClick={onOpenCity} className="mt-4 hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-info-ink rounded-lg py-1">
            <MapPin className="w-4 h-4" /><span>{selectedCity.name}</span><ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="home-search mt-4 sm:mt-5" role="search">
            <Search className="w-5 h-5 text-info-ink shrink-0" />
            <input
              type="search" enterKeyHint="search" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('dashboardSearch')} aria-label={t('dashboardSearch')}
              className="min-w-0 flex-1 bg-transparent outline-none text-base text-ink py-4 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="icon-btn !w-8 !h-8" aria-label="Clear search"><X className="w-4 h-4" /></button>
            ) : <span className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl bg-info-soft text-info-ink" aria-hidden="true"><ArrowRight className="w-4 h-4" /></span>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-ink-2">
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-info-ink" />{t('dashboardVerified')}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-success-ink" />{t('dashboardDirect')}</span>
            {availableCount > 0 && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-success rounded-full" />{availableCount} {t('availableOnly').toLowerCase()}</span>}
          </div>
        </div>
        <aside className="home-spotlight" aria-label={t('dashboardSpotlight')}>
          <House className="home-spotlight-house" strokeWidth={0.65} aria-hidden="true" />
          <span className="home-eyebrow relative">HOMESERV</span>
          <h2 className="relative mt-3 text-[1.8rem] leading-tight font-bold max-w-[16rem]">{t('dashboardSpotlight')}</h2>
          <p className="relative mt-3 text-sm leading-relaxed max-w-[15rem] text-ink-2">{t('dashboardSpotlightBody')}</p>
          <div className="relative flex items-center gap-3 mt-7" aria-hidden="true">
            {[
              ['home-cleaning', 'Home Cleaning', 'from-cyan-400 to-teal-600'],
              ['plumber', 'Plumber', 'from-cyan-500 to-blue-600'],
              ['spa', 'Beauty & Personal Care', 'from-pink-500 to-pink-700'],
            ].map(([id, title, color], i) => (
              <span key={id} className={`home-spotlight-icon ${i === 1 ? '-translate-y-2' : ''}`}>
                <CategoryIcon categoryId={id} title={title} iconName="Briefcase" colorClass={color} className="w-16 h-16 xl:w-[4.5rem] xl:h-[4.5rem]" />
              </span>
            ))}
          </div>
          <p className="relative mt-5 flex items-center gap-1.5 text-xs font-semibold text-info-ink"><Check className="w-4 h-4" />{t('dashboardNoFees')}</p>
        </aside>
      </section>

      {q ? (
        <section className="mt-8" aria-label={t('resultsFor', { query: searchQuery.trim() })}>
          <SectionHeader title={t('resultsFor', { query: searchQuery.trim() })} meta={`${results.length} ${t('pros')}`} />
          {matchingCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {matchingCategories.map((c) => (
                <button key={c.id} onClick={() => onOpenCategory(c.id)} className="chip !pl-1.5">
                  <CategoryIcon categoryId={c.id} title={c.title} iconName={c.iconName} colorClass={c.color} className="w-7 h-7" iconClassName="w-4 h-4" />
                  {c.title}<ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
          {results.length > 0 ? <CaptainGrid captains={results} categories={categories} onOpenProfile={onOpenProfile} /> : <EmptyState icon={<SearchX className="w-7 h-7" />} title={t('noMatch')} body={t('noMatchBody')} />}
        </section>
      ) : (
        <>
          <section className="home-services" aria-labelledby="services-heading">
            <div className="flex items-end justify-between gap-3 mb-6">
              <div><p className="home-eyebrow mb-1.5">{t('dashboardServicesEyebrow')}</p><h2 id="services-heading" className="text-xl sm:text-2xl font-bold text-ink">{t('dashboardServicesTitle')}</h2></div>
              <button onClick={() => onOpenCategory('all')} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-info-ink shrink-0 rounded-lg py-2">
                <img src={ALL_CATEGORIES_ICON_URL} alt="" className="w-6 h-6 rounded-md" />{t('dashboardViewAll')}<ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="home-service-grid">
              {activeCategories.map((cat) => (
                <button key={cat.id} onClick={() => onOpenCategory(cat.id)} className="home-service-tile" aria-label={cat.title}>
                  <span className="home-service-art"><CategoryIcon categoryId={cat.id} title={cat.title} iconName={cat.iconName} colorClass={cat.color} className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 lg:w-[5.25rem] lg:h-[5.25rem]" /></span>
                  <span className="home-service-title">{cat.title}</span>
                  <span className="home-service-tagline">{getServiceTagline(cat.id, cat.title, cat.tagline)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="home-how" aria-labelledby="how-heading">
            <div><p className="home-eyebrow">{t('dashboardHowEyebrow')}</p><h2 id="how-heading" className="mt-2 text-xl sm:text-2xl font-bold text-ink">{t('dashboardHowTitle')}</h2></div>
            <div className="grid sm:grid-cols-3 gap-5 mt-6">
              {[
                [Search, 'dashboardStep1', 'dashboardStep1Body'],
                [Star, 'dashboardStep2', 'dashboardStep2Body'],
                [Phone, 'dashboardStep3', 'dashboardStep3Body'],
              ].map(([Icon, title, body], index) => {
                const StepIcon = Icon as React.ElementType;
                return <div key={String(title)} className="flex gap-3"><span className="home-step-icon"><StepIcon className="w-5 h-5" /></span><div><p className="text-[11px] font-bold text-info-ink mb-1">0{index + 1}</p><h3 className="text-sm font-bold text-ink">{t(String(title))}</h3><p className="mt-1 text-xs text-ink-2 leading-relaxed">{t(String(body))}</p></div></div>;
              })}
            </div>
          </section>

          <section className="mt-10 sm:mt-12">
            <SectionHeader title={t('topRatedIn', { city: selectedCity.name })} meta={`${topRated.length} ${t('pros')}`} />
            {topRated.length > 0 ? <CaptainGrid captains={topRated} categories={categories} onOpenProfile={onOpenProfile} /> : (
              <EmptyState icon={<MapPinOff className="w-7 h-7" />} title={t('emptyCity', { city: selectedCity.name })} body={t('emptyCityBody')} action={popularCities.length > 0 ? cityChips(popularCities) : undefined} />
            )}
          </section>

          <section className="home-pro-banner mt-10 sm:mt-12">
            <span className="home-step-icon !w-12 !h-12 shrink-0"><Briefcase className="w-6 h-6" /></span>
            <div className="flex-1"><h2 className="text-lg sm:text-xl font-bold text-ink">{t('listService')}</h2><p className="mt-1 text-sm text-ink-2">{t('listServiceSub')}</p></div>
            <button onClick={() => setRole('captain')} className="btn btn-primary h-11 px-5 self-start sm:self-center">{t('getStarted')}<ArrowRight className="w-4 h-4" /></button>
          </section>
          <p className="home-signoff">{t('dashboardSignature')}</p>
        </>
      )}
    </div>
  );
};
