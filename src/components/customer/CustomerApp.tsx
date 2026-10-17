import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaptainDirectory } from './CaptainDirectory';
import { CustomerFavoritesTab } from './CustomerFavoritesTab';
import { CaptainProfileSheet } from './CaptainProfileSheet';
import { ReviewSheet } from './ReviewSheet';
import { CustomerAuthGate } from './CustomerAuthGate';
import { BottomNav } from '../ui/BottomNav';
import { House, Heart, CircleUserRound } from 'lucide-react';

type NavId = 'home' | 'favorites' | 'account';

export const CustomerApp: React.FC<{ onOpenCity: () => void; onOpenAccount: () => void }> = ({ onOpenCity, onOpenAccount }) => {
  const { customerTab, setCustomerTab, setSearchQuery, currentCustomer, setSelectedCategoryId, favorites, t } = useApp();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  if (!currentCustomer) return <CustomerAuthGate />;

  const openProfile = (captain: { id: string }) => setProfileId(captain.id);

  const selectNav = (id: NavId) => {
    if (id === 'account') return onOpenAccount();
    setCustomerTab(id);
    setSearchQuery('');
    if (id === 'home') setSelectedCategoryId(null);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <main className="pb-[calc(7.5rem+var(--sa-bottom))] xl:pb-16">
        {customerTab === 'home' && <CaptainDirectory onOpenProfile={openProfile} onOpenCity={onOpenCity} />}
        {customerTab === 'favorites' && <CustomerFavoritesTab onOpenProfile={openProfile} />}
      </main>

      <BottomNav<NavId>
        className="xl:hidden"
        items={[
          { id: 'home', label: t('home'), icon: House },
          { id: 'favorites', label: t('myFavorites'), icon: Heart, badge: favorites.length },
          { id: 'account', label: t('account'), icon: CircleUserRound },
        ]}
        active={customerTab}
        onSelect={selectNav}
      />

      <CaptainProfileSheet key={profileId ?? 'none'} captainId={profileId} onClose={() => setProfileId(null)} onWriteReview={setReviewId} />
      <ReviewSheet key={reviewId ?? 'none'} captainId={reviewId} onClose={() => setReviewId(null)} />
    </>
  );
};
