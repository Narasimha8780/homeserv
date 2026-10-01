import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { CustomerHeader } from './CustomerHeader';
import { CaptainDirectory } from './CaptainDirectory';
import { CustomerFavoritesTab } from './CustomerFavoritesTab';
import { CustomerMoreTab } from './CustomerMoreTab';
import { CityModal } from './CityModal';
import { CaptainProfileModal } from './CaptainProfileModal';
import { ReviewModal } from './ReviewModal';
import { Home, Heart, Menu } from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const { customerTab, setCustomerTab, setSearchQuery, setRole, t } = useApp();

  const [isCityModalOpen, setCityModalOpen] = useState(false);
  const [selectedCaptain, setSelectedCaptain] = useState<Captain | null>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [reviewCaptain, setReviewCaptain] = useState<Captain | null>(null);

  const handleOpenProfile = (captain: Captain) => {
    setSelectedCaptain(captain);
    setProfileOpen(true);
  };

  const TABS: { id: typeof customerTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'favorites', label: t('myFavorites'), icon: Heart },
    { id: 'more', label: t('more'), icon: Menu },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20 sm:pb-6">
      {customerTab === 'home' && <CustomerHeader onOpenCityModal={() => setCityModalOpen(true)} />}

      <div className="hidden sm:flex max-w-5xl mx-auto px-4 sm:px-6 pt-4 items-center space-x-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = customerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCustomerTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <main>
        {customerTab === 'home' && <CaptainDirectory onOpenProfile={handleOpenProfile} />}
        {customerTab === 'favorites' && <CustomerFavoritesTab onOpenProfile={handleOpenProfile} />}
        {customerTab === 'more' && <CustomerMoreTab onBecomeCaptain={() => setRole('captain')} />}
      </main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around px-2 py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = customerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCustomerTab(tab.id);
                setSearchQuery('');
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
      </nav>

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
