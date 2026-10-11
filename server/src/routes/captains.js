import { Router } from 'express';
import { Captain } from '../models/Captain.js';
import { normalizePhone } from '../utils/phone.js';
import { cityForAreas, normaliseHomePlace, normaliseServiceAreas } from '../utils/serviceAreas.js';

export const captainsRouter = Router();

// Everything — used by the admin console only. The customer app asks for just what it shows.
captainsRouter.get('/', async (_req, res) => {
  const captains = await Captain.find().sort({ createdAt: -1 });
  res.json(captains);
});

// Fields customers never need (ID documents, masked Aadhaar).
const PUBLIC = { aadhaarDocUrl: 0, skillCertUrl: 0, aadhaarMasked: 0 };
const LOCAL_LIMIT = 200;
const ranked = (filter) =>
  Captain.find({ kycStatus: 'verified', ...filter }, PUBLIC).sort({ isAvailable: -1, rating: -1, reviewCount: -1 }).limit(LOCAL_LIMIT);

// Pros for a customer's place, nearest tier first:
//   ?district=&subdistrict=  -> { mandal: [...], district: [...] }   (nobody outside the district)
//   ?city=<cityId>           -> { city: [...] }                       (no place chosen)
captainsRouter.get('/local', async (req, res) => {
  if (req.query.district != null) {
    const d = Number(req.query.district);
    const sd = Number(req.query.subdistrict);
    if (!Number.isInteger(d)) return res.status(400).json({ error: 'district is required' });
    const servesMandal = Number.isInteger(sd)
      ? {
          $or: [
            { 'homePlace.subdistrict.code': sd },
            { serviceAreas: { $elemMatch: { 'district.code': d, $or: [{ wholeDistrict: true }, { 'subdistricts.code': sd }] } } },
          ],
        }
      : { 'serviceAreas.district.code': d };
    const mandal = await ranked(servesMandal);
    const district = Number.isInteger(sd)
      ? await ranked({ 'serviceAreas.district.code': d, _id: { $nin: mandal.map((c) => c._id) } })
      : [];
    return res.json({ mandal, district });
  }
  if (req.query.city) {
    return res.json({ city: await ranked({ cityId: String(req.query.city) }) });
  }
  res.status(400).json({ error: 'district or city is required' });
});

// Specific captains (e.g. a customer's saved favourites): ?ids=a,b,c
captainsRouter.get('/by-ids', async (req, res) => {
  const ids = String(req.query.ids || '').split(',').filter(Boolean).slice(0, 100);
  if (!ids.length) return res.json([]);
  res.json(await Captain.find({ _id: { $in: ids } }, PUBLIC));
});

// Verified pros per city, for "popular cities" and choosing the city with pros.
captainsRouter.get('/stats/cities', async (_req, res) => {
  const rows = await Captain.aggregate([{ $match: { kycStatus: 'verified' } }, { $group: { _id: '$cityId', count: { $sum: 1 } } }]);
  res.json(rows.map((r) => ({ cityId: r._id, count: r.count })));
});

// A captain's own full profile (dashboard / KYC tab).
captainsRouter.get('/:id', async (req, res) => {
  const captain = await Captain.findById(req.params.id);
  if (!captain) return res.status(404).json({ error: 'Captain not found' });
  res.json(captain);
});

captainsRouter.post('/', async (req, res) => {
  const {
    name, phone, whatsapp, avatar, categories,
    experienceYears, bio, languages, startingPrice,
  } = req.body;
  let { cityId, areas } = req.body;

  // New registrations choose districts/mandals; older app versions still send a city.
  let serviceAreas = [];
  let homePlace;
  if (req.body.serviceAreas) {
    try {
      serviceAreas = await normaliseServiceAreas(req.body.serviceAreas);
      homePlace = await normaliseHomePlace(req.body.homePlace);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
    cityId = cityId || (await cityForAreas(serviceAreas));
    if (!areas?.length) {
      areas = serviceAreas.flatMap((a) => (a.wholeDistrict ? [a.district.name] : a.subdistricts.map((s) => s.name)));
    }
  }

  if (!name || !phone || !cityId || !categories?.length || !areas?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = `cap-${Date.now()}`;
  const captain = await Captain.create({
    _id: id,
    name,
    phone,
    phoneNormalized: normalizePhone(phone),
    whatsapp,
    avatar,
    cityId,
    areas,
    serviceAreas,
    ...(homePlace ? { homePlace } : {}),
    categories,
    experienceYears: experienceYears || 0,
    bio: bio || 'Experienced local professional ready to help with your requirements.',
    languages: languages || [],
    startingPrice,
    rating: 0,
    reviewCount: 0,
    isAvailable: true,
    kycStatus: 'pending',
    aadhaarMasked: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 8999),
    profileViews: 0,
    contactClicks: 0,
  });
  res.status(201).json(captain);
});

captainsRouter.patch('/:id', async (req, res) => {
  const allowed = ['bio', 'areas', 'startingPrice', 'isAvailable', 'kycStatus', 'rating', 'reviewCount'];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }
  try {
    if ('serviceAreas' in req.body) {
      updates.serviceAreas = await normaliseServiceAreas(req.body.serviceAreas);
      updates.areas = updates.serviceAreas.flatMap((a) => (a.wholeDistrict ? [a.district.name] : a.subdistricts.map((s) => s.name)));
    }
    if ('homePlace' in req.body) updates.homePlace = await normaliseHomePlace(req.body.homePlace);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const captain = await Captain.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!captain) return res.status(404).json({ error: 'Captain not found' });
  res.json(captain);
});

captainsRouter.patch('/:id/view', async (req, res) => {
  const captain = await Captain.findByIdAndUpdate(
    req.params.id,
    { $inc: { profileViews: 1 } },
    { new: true }
  );
  if (!captain) return res.status(404).json({ error: 'Captain not found' });
  res.json(captain);
});

captainsRouter.patch('/:id/contact', async (req, res) => {
  const captain = await Captain.findByIdAndUpdate(
    req.params.id,
    { $inc: { contactClicks: 1 } },
    { new: true }
  );
  if (!captain) return res.status(404).json({ error: 'Captain not found' });
  res.json(captain);
});
