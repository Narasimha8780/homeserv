import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Captain } from '../types';

export interface CaptainTier {
  id: 'mandal' | 'district' | 'city';
  title: string;
  subtitle?: string;
  captains: Captain[];
}

// Verified captains for the customer's place, nearest first (ranked by the server —
// GET /api/captains/local):
//   1. those who serve the chosen mandal (or the whole district)
//   2. everyone else working in the same district
// Nothing outside the district. With no place chosen (or nobody in the district yet), the
// selected city's pros.
export function useLocalCaptains(): { tiers: CaptainTier[]; all: Captain[]; byPlace: boolean; loading: boolean } {
  const { captains, selectedPlace, selectedCity, localTiers, localLoading } = useApp();

  return useMemo(() => {
    const byId = new Map(captains.map((c) => [c.id, c]));
    const pick = (ids?: string[]) => (ids || []).map((id) => byId.get(id)).filter((c): c is Captain => !!c && c.kycStatus === 'verified');
    const mandal = pick(localTiers?.mandal);
    const district = pick(localTiers?.district);
    const city = pick(localTiers?.city);

    if (selectedPlace && (mandal.length || district.length)) {
      const tiers: CaptainTier[] = [
        { id: 'mandal', title: `In ${selectedPlace.subdistrict.name}`, subtitle: 'Serve your mandal', captains: mandal },
        {
          id: 'district',
          title: `Elsewhere in ${selectedPlace.district.name}`,
          subtitle: 'Work in your district — ask if they can travel to you',
          captains: district,
        },
      ];
      return { tiers: tiers.filter((t) => t.captains.length), all: [...mandal, ...district], byPlace: true, loading: localLoading };
    }
    return {
      tiers: city.length ? [{ id: 'city', title: selectedCity.name, captains: city }] : [],
      all: city,
      byPlace: false,
      loading: localLoading,
    };
  }, [captains, selectedPlace, selectedCity, localTiers, localLoading]);
}
