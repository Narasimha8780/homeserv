import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminKycTab } from './AdminKycTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminCitiesTab } from './AdminCitiesTab';
import { LayoutDashboard, ShieldCheck, Grid3x3, MapPin } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { adminTab, setAdminTab, captains, t } = useApp();
  const pendingCount = captains.filter((c) => c.kycStatus === 'pending').length;

  const TABS: { id: typeof adminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'kyc', label: 'KYC Queue', icon: ShieldCheck, badge: pendingCount },
    { id: 'categories', label: 'Categories', icon: Grid3x3 },
    { id: 'cities', label: 'Cities', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 text-white px-4 sm:px-6 py-4 shadow-premium-lg">
        <div className="absolute inset-0 mesh-bg-blue opacity-25 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <h1 className="text-base sm:text-lg font-black tracking-tight">{t('adminConsole')}</h1>
          <p className="text-[11px] text-emerald-100">Approve captain listings and manage service categories</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 flex items-center space-x-2 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`shrink-0 relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {!!tab.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <main className="pb-10">
        {adminTab === 'overview' && <AdminOverviewTab />}
        {adminTab === 'kyc' && <AdminKycTab />}
        {adminTab === 'categories' && <AdminCategoriesTab />}
        {adminTab === 'cities' && <AdminCitiesTab />}
      </main>
    </div>
  );
};
