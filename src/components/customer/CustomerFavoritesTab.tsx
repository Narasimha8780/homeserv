import React from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { CaptainGrid } from './CaptainCard';
import { EmptyState } from '../ui/EmptyState';
import { Heart, Search } from 'lucide-react';

export const CustomerFavoritesTab: React.FC<{ onOpenProfile: (captain: Captain) => void }> = ({ onOpenProfile }) => {
  const { captains, favorites, categories, setCustomerTab, t } = useApp();
  const favoriteCaptains = captains.filter((c) => favorites.includes(c.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 animate-page-enter">
      <div className="mb-5">
        <h1 className="text-[1.75rem] sm:text-4xl font-bold text-ink">{t('myFavorites')}</h1>
        <p className="text-[15px] text-ink-2 mt-1">Professionals you've saved for quick access later</p>
      </div>

      {favoriteCaptains.length === 0 ? (
        <EmptyState
          tone="danger"
          icon={<Heart className="w-7 h-7" />}
          title={t('savedEmptyTitle')}
          body={t('savedEmptyBody')}
          action={
            <button onClick={() => setCustomerTab('home')} className="btn btn-primary h-11 px-5">
              <Search className="w-4 h-4" />
              {t('findServices')}
            </button>
          }
        />
      ) : (
        <CaptainGrid captains={favoriteCaptains} categories={categories} onOpenProfile={onOpenProfile} />
      )}
    </div>
  );
};
