import type { NearbyCity } from '../types';

// Pros are shown from a city within this distance of the customer's place (or in the same
// district — place centre points are approximate, so district beats a borderline distance).
export const NEARBY_RADIUS_KM = 40;
// Closer than this counts as "right in your area".
export const IN_AREA_KM = 3;

// Best city to show pros from: in range, and one that actually has pros if possible.
export function chooseNearbyCity(cities: NearbyCity[], prosIn: (cityId: string) => number): NearbyCity | null {
  const inRange = cities.filter((c) => c.distanceKm <= NEARBY_RADIUS_KM || c.sameDistrict);
  return inRange.find((c) => prosIn(c.city.id) > 0) || inRange[0] || null;
}

export const distanceLabel = (km: number) => (km <= IN_AREA_KM ? 'in your area' : `~${Math.round(km)} km away`);
