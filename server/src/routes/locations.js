import { Router } from 'express';
import { City } from '../models/City.js';
import { LgdDistrict, LgdState, LgdSubdistrict, LgdVillage } from '../models/Lgd.js';
import { normName, stateCodeFor } from '../utils/lgd.js';

export const locationsRouter = Router();

const km = (meters) => Math.round(meters / 100) / 10;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function areaFor(sub, distance) {
  const [district, state] = await Promise.all([LgdDistrict.findById(sub.d).lean(), LgdState.findById(sub.s).lean()]);
  return {
    subdistrict: sub.name,
    subdistrictCode: sub._id,
    district: district?.name,
    districtCode: sub.d,
    state: state?.name,
    stateCode: sub.s,
    approx: !!sub.approx,
    distanceKm: km(distance),
  };
}

// Where the user is and the nearest HomeServ cities — from a GPS position (?lat=&lng=) or from
// a mandal/tehsil picked in the app (?subdistrict=<LGD code>). Coordinates are only used for
// this lookup; they are not stored or logged.
locationsRouter.get('/nearest', async (req, res) => {
  let near;
  let picked = null;
  if (req.query.subdistrict != null) {
    picked = await LgdSubdistrict.findById(Number(req.query.subdistrict)).lean();
    if (!picked?.location) return res.status(404).json({ error: 'Unknown sub-district' });
    near = picked.location;
  } else {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ error: 'lat and lng (or subdistrict) are required' });
    }
    near = { type: 'Point', coordinates: [lng, lat] };
  }

  const [cityHits, areaHits] = await Promise.all([
    City.aggregate([
      { $geoNear: { near, distanceField: 'distance', spherical: true, maxDistance: 500_000, query: { isActive: true } } },
      { $limit: 8 },
    ]),
    picked
      ? Promise.resolve([])
      : LgdSubdistrict.aggregate([
          { $geoNear: { near, distanceField: 'distance', spherical: true, maxDistance: 200_000 } },
          { $limit: 10 },
        ]).catch(() => []),
  ]);

  // Many sub-districts only have their district's centre (approx). Prefer a precisely located
  // one unless it is clearly farther away than the nearest hit.
  let area = null;
  if (picked) {
    area = await areaFor(picked, 0);
  } else if (areaHits.length) {
    const nearest = areaHits[0];
    const best = areaHits.find((a) => !a.approx && a.distance <= nearest.distance + 15_000) || nearest;
    area = await areaFor(best, best.distance);
  }

  // A city counts as "in your district" when it is the district itself, one of its mandals/
  // tehsils, or was added from that district — the centre points are approximate, so this is
  // more reliable than distance alone near the edge of the search radius.
  const districtPlaces = area
    ? new Set([normName(area.district), ...(await LgdSubdistrict.find({ d: area.districtCode }, { n: 1 }).lean()).map((x) => x.n)])
    : new Set();
  const inDistrict = (c) =>
    !!area && c.state === area.state && (c.district ? c.district === area.district : districtPlaces.has(normName(c.name)));

  res.json({
    area,
    cities: cityHits.map(({ distance, ...c }) => ({
      city: City.hydrate(c).toJSON(),
      distanceKm: km(distance),
      sameDistrict: inDistrict(c),
    })),
  });
});

// Step-by-step picker: State -> District -> Mandal/Tehsil -> Village.
const byName = (a, b) => a.name.localeCompare(b.name);
const plain = (list) => list.map((p) => ({ code: p._id, name: p.name })).sort(byName);

locationsRouter.get('/states', async (_req, res) => {
  res.json(plain(await LgdState.find().lean()));
});

locationsRouter.get('/districts', async (req, res) => {
  const s = req.query.stateCode != null ? Number(req.query.stateCode) : await stateCodeFor(String(req.query.state || ''));
  if (s == null || Number.isNaN(s)) return res.json([]);
  res.json(plain(await LgdDistrict.find({ s }, { name: 1 }).lean()));
});

locationsRouter.get('/subdistricts', async (req, res) => {
  const d = Number(req.query.district);
  if (!Number.isInteger(d)) return res.json([]);
  res.json(plain(await LgdSubdistrict.find({ d }, { name: 1 }).lean()));
});

locationsRouter.get('/villages', async (req, res) => {
  const sd = Number(req.query.subdistrict);
  if (!Number.isInteger(sd)) return res.json([]);
  res.json(plain(await LgdVillage.find({ sd }, { name: 1 }).limit(5000).lean()));
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
