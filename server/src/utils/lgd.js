import { readFileSync } from 'node:fs';
import { LgdDistrict, LgdState, LgdSubdistrict, LgdVillage } from '../models/Lgd.js';

// Precomputed centre points (see scripts/build_lgd_geo.py). Values are [lat, lng] with an
// optional trailing 1 meaning "approximate — inherited from the district".
const GEO = JSON.parse(readFileSync(new URL('../data/lgdGeo.json', import.meta.url), 'utf8'));

// Same normalisation as scripts/build_lgd_geo.py, so keys line up.
export function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\(.*?\)/g, ' ')
    .trim()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// LGD writes "Jammu And Kashmir", "The Dadra And Nagar Haveli And Daman And Diu"; the app uses
// "Jammu and Kashmir", "Dadra and Nagar Haveli and Daman and Diu".
export function appStateName(lgdName) {
  return lgdName.replace(/^The\s+/i, '').replace(/\bAnd\b/g, 'and').trim();
}

// A few LGD names are ALL CAPS ("MAUGANJ"); show them in title case.
export function displayName(name) {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (clean === clean.toUpperCase() && /[A-Z]{3,}/.test(clean)) {
    return clean.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  }
  return clean;
}

export const toPoint = ([lat, lng]) => ({ type: 'Point', coordinates: [lng, lat] });

export const geoFor = (level, code) => GEO[level === 'district' ? 'districts' : 'subdistricts'][String(code)];

export const seededCityGeo = (name, state) => GEO.cities[`${normName(name)}|${normName(state)}`];

// Cached briefly, and never while empty, so an import done while the API is running is
// picked up without a restart.
let stateCodes = null;
let stateCodesAt = 0;
export async function stateCodeFor(appState) {
  if (!stateCodes || Date.now() - stateCodesAt > 10 * 60_000) {
    const states = await LgdState.find().lean();
    stateCodes = states.length ? new Map(states.map((s) => [normName(s.name), s._id])) : null;
    stateCodesAt = Date.now();
    if (!stateCodes) return undefined;
  }
  return stateCodes.get(normName(appState));
}
export function clearStateCache() {
  stateCodes = null;
}

// Best-known coordinates for a city/town/village name within a state: the precomputed city
// list first, then an LGD sub-district, district or village with that name.
export async function locateByName(name, appState) {
  const seeded = seededCityGeo(name, appState);
  if (seeded) return { location: toPoint(seeded), approx: false };

  const s = await stateCodeFor(appState);
  if (s == null) return null;
  const n = normName(name);
  const sub =
    (await LgdSubdistrict.findOne({ s, n, approx: false }).lean()) || (await LgdSubdistrict.findOne({ s, n }).lean());
  if (sub?.location) return { location: sub.location, approx: sub.approx };
  const district = await LgdDistrict.findOne({ s, n }).lean();
  if (district?.location) return { location: district.location, approx: district.approx };
  const village = await LgdVillage.findOne({ s, n }).lean();
  if (village) {
    const parent = await LgdSubdistrict.findById(village.sd).lean();
    if (parent?.location) return { location: parent.location, approx: true };
  }
  return null;
}

// Resolve an LGD reference picked in the app ({ type, code }) to a name, state and location.
export async function resolveLgdPlace(type, code) {
  const id = Number(code);
  if (!Number.isInteger(id)) return null;
  let place;
  let locationSource;
  if (type === 'district') {
    place = await LgdDistrict.findById(id).lean();
    locationSource = place;
  } else if (type === 'subdistrict') {
    place = await LgdSubdistrict.findById(id).lean();
    locationSource = place;
  } else if (type === 'village') {
    place = await LgdVillage.findById(id).lean();
    locationSource = place && (await LgdSubdistrict.findById(place.sd).lean());
  }
  if (!place) return null;
  const [state, district] = await Promise.all([
    LgdState.findById(place.s).lean(),
    type === 'district' ? null : LgdDistrict.findById(place.d).lean(),
  ]);
  return {
    name: place.name,
    state: state?.name,
    district: district?.name,
    location: locationSource?.location,
  };
}
