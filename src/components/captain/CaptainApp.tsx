import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaptainLoginForm } from './CaptainLoginForm';
import { CaptainRegistrationForm } from './CaptainRegistrationForm';
import { CaptainDashboard } from './CaptainDashboard';
import { CaptainKycTab } from './CaptainKycTab';
import { CaptainReviewsTab } from './CaptainReviewsTab';
import { BottomNav } from '../ui/BottomNav';
import { firstName } from '../../utils/format';
import { LayoutGrid, Star, ShieldCheck, Wrench, BadgeCheck, Clock3 } from 'lucide-react';

type CaptainTab = 'dashboard' | 'reviews' | 'kyc';

export const CaptainApp: React.FC = () => {
  const { captainTab, setCaptainTab, currentCaptain, t } = useApp();
  const [isRegistering, setRegistering] = useState(false);
  // Set when registration finds the number already has an account.
  const [loginPrefill, setLoginPrefill] = useState<{ phone: string; reset: boolean } | null>(null);

  if (!currentCaptain) {
    return isRegistering ? (
      <CaptainRegistrationForm
        onBack={(prefill) => {
          setLoginPrefill(prefill ?? null);
          setRegistering(false);
        }}
      />
    ) : (
      <CaptainLoginForm
        key={loginPrefill ? `${loginPrefill.phone}-${loginPrefill.reset}` : 'login'}
        initialPhone={loginPrefill?.phone}
        startWithReset={loginPrefill?.reset}
        onNewCaptain={() => setRegistering(true)}
      />
    );
  }

  const TABS: { id: CaptainTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutGrid },
    { id: 'reviews', label: t('reviews'), icon: Star },
    { id: 'kyc', label: t('verification'), icon: ShieldCheck, badge: currentCaptain.kycStatus === 'verified' ? undefined : 1 },
  ];

  const selectTab = (id: CaptainTab) => {
    setCaptainTab(id);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-10 pb-[calc(7.5rem+var(--sa-bottom))] sm:pb-14 animate-page-enter">
        <div className="captain-workspace-header">
          <div>
            <span className="pill bg-accent-soft text-info-ink !px-2.5">
              <Wrench className="w-3.5 h-3.5" /> Captain workspace
            </span>
            <h1 className="mt-2.5 text-[1.75rem] sm:text-4xl font-bold text-ink">
              {t('greeting')}, {firstName(currentCaptain.name)}
            </h1>
            <p className="text-[15px] text-ink-2 mt-1">Your skills. Your next opportunity. Manage your listing here.</p>
          </div>

          <span className={`captain-listing-status ${currentCaptain.kycStatus === 'verified' ? 'text-success-ink bg-success-soft' : 'text-warn-ink bg-warn-soft'}`}>
            {currentCaptain.kycStatus === 'verified' ? <BadgeCheck className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
            {currentCaptain.kycStatus === 'verified' ? 'Your listing is live' : currentCaptain.kycStatus === 'rejected' ? 'Verification needs attention' : 'Verification pending'}
          </span>

          <div className="hidden sm:flex p-1 rounded-2xl bg-surface-2 border border-line" role="tablist" aria-label="Captain sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = captainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(tab.id)}
                  className={`relative flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all ${
                    active ? 'bg-surface-solid text-ink shadow-card border border-line' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-info-ink' : ''}`} />
                  {tab.label}
                  {!!tab.badge && <span className="w-2 h-2 rounded-full bg-warn" />}
                </button>
              );
            })}
          </div>
        </div>

        <main className="mt-6 sm:mt-8">
          {captainTab === 'dashboard' && <CaptainDashboard onOpenTab={selectTab} />}
          {captainTab === 'reviews' && <CaptainReviewsTab />}
          {captainTab === 'kyc' && <CaptainKycTab />}
        </main>
      </div>

      <BottomNav<CaptainTab> items={TABS} active={captainTab} onSelect={selectTab} />
    </>
  );
};
