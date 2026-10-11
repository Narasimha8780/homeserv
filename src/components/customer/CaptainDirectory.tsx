import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain } from '../../types';
import { HomeView } from './HomeView';
import { CategoryView } from './CategoryView';

// Home ⇄ category page, kept in sync with browser history so the browser / Android
// Back button returns from a category to the home grid.
export const CaptainDirectory: React.FC<{
  onOpenProfile: (captain: Captain) => void;
  onOpenCity: () => void;
}> = ({ onOpenProfile, onOpenCity }) => {
  const { selectedCategoryId, setSelectedCategoryId, setSearchQuery } = useApp();

  const openCategory = (id: string) => {
    setSearchQuery('');
    setSelectedCategoryId(id);
    window.history.pushState({ homeservCat: id }, '');
    window.scrollTo({ top: 0 });
  };

  const goBack = () => {
    if (window.history.state?.homeservCat) window.history.back();
    else setSelectedCategoryId(null);
  };

  useEffect(() => {
    if (!selectedCategoryId && window.history.state?.homeservCat) window.history.replaceState(null, '');
    const onPop = (e: PopStateEvent) => {
      setSearchQuery('');
      setSelectedCategoryId(e.state?.homeservCat ?? null);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selectedCategoryId) {
    return <CategoryView key={selectedCategoryId} categoryId={selectedCategoryId} onBack={goBack} onOpenProfile={onOpenProfile} />;
  }
  return <HomeView onOpenCategory={openCategory} onOpenProfile={onOpenProfile} onOpenCity={onOpenCity} />;
};
