import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminKycTab } from './AdminKycTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminCitiesTab } from './AdminCitiesTab';
import { AdminPinResetsTab } from './AdminPinResetsTab';
import { Logo } from '../ui/Logo';
import { LayoutDashboard, ShieldCheck, Grid3x3, MapPin, KeyRound, Sun, Moon } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { adminTab, setAdminTab, captains, resolvedTheme, setTheme } = useApp();
  const pendingCount = captains.filter((c) => c.kycStatus === 'pending').length;

  const TABS: { id: typeof adminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'kyc', label: 'KYC Queue', icon: ShieldCheck, badge: pendingCount },
    { id: 'categories', label: 'Categories', icon: Grid3x3 },
    { id: 'cities', label: 'Cities', icon: MapPin },
    { id: 'pinResets', label: 'PIN Resets', icon: KeyRound },
  ];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 glass border-b border-line pt-safe">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center gap-3">
          <Logo />
          <span className="pill bg-info-soft text-info-ink">Admin</span>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="icon-btn w-9 h-9 ml-auto"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Directory admin</h1>
        <p className="text-[15px] text-ink-2 mt-1">Approve captain listings and manage categories and cities.</p>

        <nav className="mt-5 flex gap-1 p-1 rounded-2xl bg-surface-2 border border-line overflow-x-auto no-scrollbar w-full sm:w-fit" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setAdminTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-surface-solid text-ink shadow-card border border-line' : 'text-ink-3 hover:text-ink'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : ''}`} />
                {tab.label}
                {!!tab.badge && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-on-accent text-[11px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="pb-16">
        {adminTab === 'overview' && <AdminOverviewTab />}
        {adminTab === 'kyc' && <AdminKycTab />}
        {adminTab === 'categories' && <AdminCategoriesTab />}
        {adminTab === 'cities' && <AdminCitiesTab />}
        {adminTab === 'pinResets' && <AdminPinResetsTab />}
      </main>
    </div>
  );
};
