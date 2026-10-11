import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Captain } from '../types';

export interface CaptainTier {
  id: 'mandal' | 'district' | 'city';
  title: string;
  subtitle?: string;
  captains: Captain[];
}

const servesMandal = (cap: Captain, districtCode: number, subdistrictCode: number) =>
  cap.homePlace?.subdistrict?.code === subdistrictCode ||
  !!cap.serviceAreas?.some(
    (a) => a.district.code === districtCode && (a.wholeDistrict || a.subdistricts.some((s) => s.code === subdistrictCode))
  );

const servesDistrict = (cap: Captain, districtCode: number) => !!cap.serviceAreas?.some((a) => a.district.code === districtCode);

// Verified captains for the customer's place, nearest first:
//   1. those who serve the chosen mandal (or the whole district)
//   2. everyone else working in the same district
// Nothing outside the district. With no place chosen (or nobody in the district yet), falls
// back to the pros of the selected city.
export function useLocalCaptains(): { tiers: CaptainTier[]; all: Captain[]; byPlace: boolean } {
  const { captains, selectedPlace, selectedCity } = useApp();

  return useMemo(() => {
    const verified = captains.filter((c) => c.kycStatus === 'verified');
    if (selectedPlace) {
      const d = selectedPlace.district.code;
      const sd = selectedPlace.subdistrict.code;
      const inMandal = verified.filter((c) => servesMandal(c, d, sd));
      const inDistrict = verified.filter((c) => !inMandal.includes(c) && servesDistrict(c, d));
      if (inMandal.length || inDistrict.length) {
        const tiers: CaptainTier[] = [
          { id: 'mandal', title: `In ${selectedPlace.subdistrict.name}`, subtitle: 'Serve your mandal', captains: inMandal },
          {
            id: 'district',
            title: `Elsewhere in ${selectedPlace.district.name}`,
            subtitle: 'Work in your district — ask if they can travel to you',
            captains: inDistrict,
          },
        ];
        return { tiers: tiers.filter((t) => t.captains.length), all: [...inMandal, ...inDistrict], byPlace: true };
      }
    }
    const inCity = verified.filter((c) => c.cityId === selectedCity.id);
    return {
      tiers: inCity.length ? [{ id: 'city', title: selectedCity.name, captains: inCity }] : [],
      all: inCity,
      byPlace: false,
    };
  }, [captains, selectedPlace, selectedCity]);
}
