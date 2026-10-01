import React from 'react';
import { useApp } from '../../context/AppContext';
import { CaptainRegistrationForm } from './CaptainRegistrationForm';
import { CaptainDashboard } from './CaptainDashboard';
import { CaptainKycTab } from './CaptainKycTab';
import { CaptainReviewsTab } from './CaptainReviewsTab';
import { LayoutGrid, Star, ShieldCheck, UserPlus } from 'lucide-react';

export const CaptainApp: React.FC = () => {
  const { captainTab, setCaptainTab, setActiveCaptainId, currentCaptain, t } = useApp();

  const TABS: { id: typeof captainTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'kyc', label: 'KYC', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight">{t('captainPortalTitle')}</h1>
            <p className="text-[11px] text-orange-100">List your service for free and get discovered by local customers</p>
          </div>
        </div>
      </div>

      {!currentCaptain ? (
        <CaptainRegistrationForm />
      ) : (
        <>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 flex items-center space-x-2 overflow-x-auto custom-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = captainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCaptainTab(tab.id)}
                  className={`shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setActiveCaptainId(null)}
              className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 ml-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Captain</span>
            </button>
          </div>

          <main className="pb-10">
            {captainTab === 'dashboard' && <CaptainDashboard />}
            {captainTab === 'reviews' && <CaptainReviewsTab />}
            {captainTab === 'kyc' && <CaptainKycTab />}
          </main>
        </>
      )}
    </div>
  );
};
