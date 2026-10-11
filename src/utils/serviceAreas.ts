import type { ServiceArea } from '../types';

export const MAX_DISTRICTS = 5;

// API shape for creating/updating a captain's service areas.
export const toServiceAreaInput = (areas: ServiceArea[]) =>
  areas.map((a) => ({ districtCode: a.district.code, wholeDistrict: a.wholeDistrict, subdistrictCodes: a.subdistricts.map((s) => s.code) }));

// "Sanganer, Amber · Jaipur" / "All of Jaipur district"
export const describeArea = (a: ServiceArea) =>
  a.wholeDistrict ? `All of ${a.district.name} district` : `${a.subdistricts.map((s) => s.name).join(', ')} · ${a.district.name}`;
