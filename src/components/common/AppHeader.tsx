import React from 'react';
import { useApp } from '../../context/AppContext';
import type { AppLanguage } from '../../types';
import { LANGUAGES } from '../../i18n/languages';
import { Logo } from '../ui/Logo';
import { initials } from '../../utils/format';
import { MapPin, ChevronDown, Globe, Sun, Moon, Briefcase, Search, Menu } from 'lucide-react';

// Single compact app bar for web and Android. Phones get logo + city + account button
// (everything else lives in the account sheet / bottom nav); desktop adds inline nav,
// language, theme and the professional-portal switch.
export const AppHeader: React.FC<{ onOpenCity: () => void; onOpenAccount: () => void }> = ({ onOpenCity, onOpenAccount }) => {
  const {
    role, setRole, customerTab, setCustomerTab, selectedCategoryId, setSelectedCategoryId, setSearchQuery,
    selectedCity, selectedPlace, language, setLanguage, resolvedTheme, setTheme, currentCustomer, currentCaptain, favorites, t,
  } = useApp();

  const goHome = () => {
    setRole('customer');
    setCustomerTab('home');
    setSelectedCategoryId(null);
    setSearchQuery('');
  };

  const NAV = [
    { id: 'home' as const, label: t('home') },
    { id: 'favorites' as const, label: t('myFavorites'), count: favorites.length },
  ];

  const placeName = selectedPlace ? selectedPlace.village?.name || selectedPlace.subdistrict.name : selectedCity.name;
  const accountName = role === 'captain' ? currentCaptain?.name : currentCustomer?.name;

  return (
    <header className="sticky top-0 z-40 glass border-b border-line pt-safe">
      <div className="max-w-6xl mx-auto h-14 sm:h-16 px-4 sm:px-6 flex items-center gap-2 sm:gap-3">
        <button onClick={goHome} aria-label="HomeServ home" className="shrink-0 rounded-xl">
          <Logo markClassName="w-9 h-9" textClassName="text-[1.35rem]" hideTextOnTiny />
        </button>

        <button
          onClick={onOpenCity}
          aria-label={`${t('selectCity')}: ${placeName}`}
          className="flex items-center gap-1.5 min-w-0 h-9 pl-2.5 pr-2 rounded-full bg-surface-2 border border-line text-[13px] font-semibold text-ink hover:bg-surface-3 transition-colors"
        >
          <MapPin className="w-4 h-4 text-accent shrink-0" />
          <span className="truncate max-w-[7.5rem] sm:max-w-[11rem]">{placeName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-ink-3 shrink-0" />
        </button>

        {role === 'customer' && currentCustomer && (
          <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Main">
            {NAV.map((item) => {
              const active = customerTab === item.id && !(item.id === 'home' && selectedCategoryId);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCustomerTab(item.id);
                    setSearchQuery('');
                    if (item.id === 'home') setSelectedCategoryId(null);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`h-9 px-3.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    active ? 'bg-surface-2 text-ink border border-line' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {item.label}
                  {!!item.count && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent-soft text-accent-ink text-[11px] font-bold flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="hidden lg:flex relative items-center">
            <Globe className="w-4 h-4 absolute left-3 text-ink-3 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              aria-label={t('language')}
              className="h-9 pl-8 pr-3 rounded-full bg-surface-2 border border-line text-[13px] font-semibold text-ink appearance-none hover:bg-surface-3 transition-colors"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-[#16161a] bg-white">
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="icon-btn hidden sm:inline-flex w-9 h-9"
            aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={resolvedTheme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {role === 'customer' ? (
            <button onClick={() => setRole('captain')} className="btn btn-secondary hidden md:inline-flex h-9 px-3.5 text-[13px]">
              <Briefcase className="w-4 h-4 text-accent" />
              {t('forPros')}
            </button>
          ) : (
            <button onClick={goHome} className="btn btn-secondary h-9 px-3 text-[13px]" aria-label={t('findServices')}>
              <Search className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">{t('findServices')}</span>
            </button>
          )}

          <button onClick={onOpenAccount} aria-label={t('account')} className="rounded-full shrink-0">
            {accountName ? (
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white font-display font-bold text-[13px] flex items-center justify-center ring-2 ring-line-strong">
                {initials(accountName)}
              </span>
            ) : (
              <span className="icon-btn w-9 h-9">
                <Menu className="w-[18px] h-[18px]" />
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
