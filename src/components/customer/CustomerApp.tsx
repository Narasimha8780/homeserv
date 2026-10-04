import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { CustomerHeader } from './CustomerHeader';
import { CaptainDirectory } from './CaptainDirectory';
import { CustomerFavoritesTab } from './CustomerFavoritesTab';
import { CustomerMenu } from './CustomerMenu';
import { CityModal } from './CityModal';
import { CaptainProfileModal } from './CaptainProfileModal';
import { ReviewModal } from './ReviewModal';
import { CustomerAuthGate } from './CustomerAuthGate';
import { pushBackHandler } from '../../utils/backStack';
import { Home, Heart, Menu, X } from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const { customerTab, setCustomerTab, setSearchQuery, currentCustomer, selectedCategoryId, setSelectedCategoryId, t } = useApp();

  const [isCityModalOpen, setCityModalOpen] = useState(false);
  const [selectedCaptain, setSelectedCaptain] = useState<Captain | null>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [reviewCaptain, setReviewCaptain] = useState<Captain | null>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  // Back closes the top-most open pop-up before anything else.
  useEffect(() => {
    if (!isCityModalOpen && !isProfileOpen && !reviewCaptain && !isMenuOpen) return;
    return pushBackHandler(() => {
      if (reviewCaptain) setReviewCaptain(null);
      else if (isProfileOpen) setProfileOpen(false);
      else if (isCityModalOpen) setCityModalOpen(false);
      else setMenuOpen(false);
      return true;
    });
  }, [isCityModalOpen, isProfileOpen, reviewCaptain, isMenuOpen]);

  const handleOpenProfile = (captain: Captain) => {
    setSelectedCaptain(captain);
    setProfileOpen(true);
  };

  const TABS: { id: typeof customerTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'favorites', label: t('myFavorites'), icon: Heart },
  ];

  if (!currentCustomer) return <CustomerAuthGate />;

  return (
    <div className="min-h-screen bg-transparent pb-28 sm:pb-6">
      <div className="sm:flex sm:max-w-7xl sm:mx-auto">
        {/* Left sidebar — desktop/tablet only; phones keep the bottom tab bar */}
        <aside className="hidden sm:block sm:w-56 sm:shrink-0 sm:pt-6 sm:pl-4 sm:pr-2 sm:sticky sm:top-16 sm:self-start sm:max-h-[calc(100vh-4rem)] sm:overflow-y-auto custom-scrollbar sm:pb-6">
          <CustomerMenu />
        </aside>

        <div className="min-w-0 flex-1">
          {customerTab === 'home' && !selectedCategoryId && <CustomerHeader onOpenCityModal={() => setCityModalOpen(true)} />}

          <main>
            {customerTab === 'home' && <CaptainDirectory onOpenProfile={handleOpenProfile} />}
            {customerTab === 'favorites' && <CustomerFavoritesTab onOpenProfile={handleOpenProfile} />}
          </main>
        </div>
      </div>

      <nav className="sm:hidden glass-dock fixed bottom-3 inset-x-4 z-40 rounded-full flex items-center justify-around px-2 py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = customerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCustomerTab(tab.id);
                setSearchQuery('');
                if (tab.id === 'home') setSelectedCategoryId(null);
              }}
              className={`flex flex-col items-center justify-center space-y-0.5 px-4 py-1.5 rounded-xl min-w-[64px] transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-blue-100' : ''}`} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMenuOpen(true)}
          className={`flex flex-col items-center justify-center space-y-0.5 px-4 py-1.5 rounded-xl min-w-[64px] transition-colors ${
            isMenuOpen ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold">{t('more')}</span>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[84%] max-w-xs bg-white/70 shadow-premium-lg overflow-y-auto animate-drawer-enter p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 font-black text-slate-900">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs flex items-center justify-center">HS</span>
                Menu
              </span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full bg-white border border-slate-200 text-slate-600" aria-label="Close menu">
                <X className="w-4 h-4" />
              </button>
            </div>
            <CustomerMenu showNav={false} onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <CityModal isOpen={isCityModalOpen} onClose={() => setCityModalOpen(false)} />
      <CaptainProfileModal
        captain={selectedCaptain}
        isOpen={isProfileOpen}
        onClose={() => setProfileOpen(false)}
        onWriteReview={(cap) => setReviewCaptain(cap)}
      />
      <ReviewModal captain={reviewCaptain} isOpen={!!reviewCaptain} onClose={() => setReviewCaptain(null)} />
    </div>
  );
};
