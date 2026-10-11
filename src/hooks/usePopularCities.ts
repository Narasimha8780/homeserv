import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

// Cities that actually have verified pros (counts from the server) — offered as one-tap
// switches in the city picker and when the selected place has nobody listed yet.
export const usePopularCities = () => {
  const { cityCounts, allCities } = useApp();
  return useMemo(
    () =>
      allCities
        .filter((c) => c.isActive && cityCounts[c.id])
        .map((city) => ({ city, count: cityCounts[city.id] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    [cityCounts, allCities]
  );
};
