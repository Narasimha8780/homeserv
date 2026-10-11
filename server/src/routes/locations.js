import { Router } from 'express';
import { City } from '../models/City.js';
import { LgdDistrict, LgdState, LgdSubdistrict, LgdVillage } from '../models/Lgd.js';
import { normName, stateCodeFor } from '../utils/lgd.js';

export const locationsRouter = Router();

const km = (meters) => Math.round(meters / 100) / 10;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GPS -> where the user is (LGD sub-district/district/state) and the nearest HomeServ cities.
// Coordinates are only used for this lookup; they are not stored or logged.
locationsRouter.get('/nearest', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  const near = { type: 'Point', coordinates: [lng, lat] };

  const [cityHits, areaHits] = await Promise.all([
    City.aggregate([
      { $geoNear: { near, distanceField: 'distance', spherical: true, maxDistance: 500_000, query: { isActive: true } } },
      { $limit: 5 },
    ]),
    LgdSubdistrict.aggregate([
      { $geoNear: { near, distanceField: 'distance', spherical: true, maxDistance: 200_000 } },
      { $limit: 10 },
    ]).catch(() => []),
  ]);

  // Many sub-districts only have their district's centre (approx). Prefer a precisely located
  // one unless it is clearly farther away than the nearest hit.
  let area = null;
  if (areaHits.length) {
    const nearest = areaHits[0];
    const best = areaHits.find((a) => !a.approx && a.distance <= nearest.distance + 15_000) || nearest;
    const [district, state] = await Promise.all([LgdDistrict.findById(best.d).lean(), LgdState.findById(best.s).lean()]);
    area = {
      subdistrict: best.name,
      subdistrictCode: best._id,
      district: district?.name,
      districtCode: best.d,
      state: state?.name,
      approx: !!best.approx,
      distanceKm: km(best.distance),
    };
  }

  res.json({
    area,
    cities: cityHits.map(({ distance, ...c }) => ({ city: City.hydrate(c).toJSON(), distanceKm: km(distance) })),
  });
});

// Type-ahead over official LGD places: districts, sub-districts (tehsil/taluk/mandal) and villages.
locationsRouter.get('/search', async (req, res) => {
  const q = normName(req.query.q);
  if (q.length < 2) return res.json([]);
  let filter = { n: new RegExp(`^${escapeRegex(q)}`) };
  if (req.query.state) {
    const s = await stateCodeFor(String(req.query.state));
    if (s == null) return res.json([]);
    filter = { s, ...filter };
  }

  const [districts, subdistricts, villages] = await Promise.all([
    LgdDistrict.find(filter).sort({ n: 1 }).limit(5).lean(),
    LgdSubdistrict.find(filter).sort({ n: 1 }).limit(8).lean(),
    LgdVillage.find(filter).sort({ n: 1 }).limit(15).lean(),
  ]);

  const districtIds = [...new Set([...subdistricts, ...villages].map((p) => p.d))];
  const subIds = [...new Set(villages.map((v) => v.sd))];
  const stateIds = [...new Set([...districts, ...subdistricts, ...villages].map((p) => p.s))];
  const [dNames, sdNames, sNames] = await Promise.all([
    LgdDistrict.find({ _id: { $in: districtIds } }, { name: 1 }).lean(),
    LgdSubdistrict.find({ _id: { $in: subIds } }, { name: 1 }).lean(),
    LgdState.find({ _id: { $in: stateIds } }, { name: 1 }).lean(),
  ]);
  const nameOf = (list) => new Map(list.map((x) => [x._id, x.name]));
  const dMap = nameOf(dNames);
  const sdMap = nameOf(sdNames);
  const sMap = nameOf(sNames);

  // Exact name matches first, then shorter names, keeping districts > sub-districts > villages.
  const rank = (p) => (p.n === q ? 0 : 1);
  const order = (a, b) => rank(a) - rank(b) || a.n.length - b.n.length;
  res.json([
    ...districts.sort(order).map((p) => ({ type: 'district', code: p._id, name: p.name, state: sMap.get(p.s) })),
    ...subdistricts.sort(order).map((p) => ({ type: 'subdistrict', code: p._id, name: p.name, district: dMap.get(p.d), state: sMap.get(p.s) })),
    ...villages.sort(order).map((p) => ({
      type: 'village',
      code: p._id,
      name: p.name,
      subdistrict: sdMap.get(p.sd),
      district: dMap.get(p.d),
      state: sMap.get(p.s),
    })),
  ]);
});
