import { City } from '../models/City.js';
import { LgdDistrict, LgdState, LgdSubdistrict, LgdVillage } from '../models/Lgd.js';
import { normName } from './lgd.js';

const MAX_DISTRICTS = 5;
const MAX_MANDALS = 40;

// Validates captain service areas against the LGD tables and fills in official names.
// Input: [{ districtCode, wholeDistrict, subdistrictCodes: [] }]. Throws Error with a message.
export async function normaliseServiceAreas(input) {
  if (!Array.isArray(input) || input.length === 0) throw new Error('Choose at least one district you work in');
  if (input.length > MAX_DISTRICTS) throw new Error(`You can choose up to ${MAX_DISTRICTS} districts`);
  const out = [];
  let mandals = 0;
  for (const raw of input) {
    const district = await LgdDistrict.findById(Number(raw.districtCode ?? raw.district?.code)).lean();
    if (!district) throw new Error('Unknown district');
    if (out.some((a) => a.district.code === district._id)) continue;
    const state = await LgdState.findById(district.s).lean();
    const codes = [...new Set((raw.subdistrictCodes ?? raw.subdistricts?.map((s) => s.code) ?? []).map(Number))];
    const wholeDistrict = !!raw.wholeDistrict;
    let subdistricts = [];
    if (!wholeDistrict) {
      if (codes.length === 0) throw new Error(`Choose mandals in ${district.name}, or "Whole district"`);
      const found = await LgdSubdistrict.find({ _id: { $in: codes }, d: district._id }, { name: 1 }).lean();
      if (found.length !== codes.length) throw new Error(`Some mandals are not in ${district.name}`);
      subdistricts = found.map((s) => ({ code: s._id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name));
      mandals += subdistricts.length;
    }
    out.push({
      state: { code: state._id, name: state.name },
      district: { code: district._id, name: district.name },
      wholeDistrict,
      subdistricts,
    });
  }
  if (mandals > MAX_MANDALS) throw new Error(`You can choose up to ${MAX_MANDALS} mandals`);
  return out;
}

// Optional home village: { subdistrictCode, villageCode? } -> names filled in.
export async function normaliseHomePlace(input) {
  if (!input?.subdistrictCode) return undefined;
  const sub = await LgdSubdistrict.findById(Number(input.subdistrictCode)).lean();
  if (!sub) throw new Error('Unknown mandal');
  const [district, state, village] = await Promise.all([
    LgdDistrict.findById(sub.d).lean(),
    LgdState.findById(sub.s).lean(),
    input.villageCode ? LgdVillage.findOne({ _id: Number(input.villageCode), sd: sub._id }).lean() : null,
  ]);
  if (input.villageCode && !village) throw new Error('That village is not in the chosen mandal');
  return {
    state: { code: state._id, name: state.name },
    district: { code: district._id, name: district.name },
    subdistrict: { code: sub._id, name: sub.name },
    ...(village ? { village: { code: village._id, name: village.name } } : {}),
  };
}

// Nearest HomeServ city to a captain's first service area — keeps the older city-based
// screens (admin stats, city filters) working for captains who registered by mandal.
export async function cityForAreas(areas) {
  const first = areas[0];
  const point =
    (first.subdistricts[0] && (await LgdSubdistrict.findById(first.subdistricts[0].code).lean())?.location) ||
    (await LgdDistrict.findById(first.district.code).lean())?.location;
  if (!point) return null;
  const [hit] = await City.aggregate([
    { $geoNear: { near: point, distanceField: 'distance', spherical: true, query: { isActive: true } } },
    { $limit: 1 },
  ]);
  return hit?._id ?? null;
}

// Existing captains registered with only a city: serve that city's whole district.
export async function districtForCity(city) {
  const s = (await LgdState.find().lean()).find((st) => normName(st.name) === normName(city.state))?._id;
  if (s == null) return null;
  const byName = await LgdDistrict.findOne({ s, n: normName(city.district || city.name) }).lean();
  if (byName) return byName;
  if (!city.location) return null;
  const [sub] = await LgdSubdistrict.aggregate([
    { $geoNear: { near: city.location, distanceField: 'distance', spherical: true, query: { s, approx: false }, maxDistance: 60_000 } },
    { $limit: 1 },
  ]);
  return sub ? LgdDistrict.findById(sub.d).lean() : null;
}
