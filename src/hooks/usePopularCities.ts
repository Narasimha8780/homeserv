import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

// Cities that actually have verified pros — offered as one-tap switches in the city
// picker and when the selected city has nobody listed yet.
export const usePopularCities = () => {
  const { captains, allCities } = useApp();
  return useMemo(() => {
    const counts = new Map<string, number>();
    captains.filter((c) => c.kycStatus === 'verified').forEach((c) => counts.set(c.cityId, (counts.get(c.cityId) || 0) + 1));
    return allCities
      .filter((c) => c.isActive && counts.has(c.id))
      .map((city) => ({ city, count: counts.get(city.id)! }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [captains, allCities]);
};
