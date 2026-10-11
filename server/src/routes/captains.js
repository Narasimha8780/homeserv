import { Router } from 'express';
import { Captain } from '../models/Captain.js';
import { normalizePhone } from '../utils/phone.js';
import { cityForAreas, normaliseHomePlace, normaliseServiceAreas } from '../utils/serviceAreas.js';

export const captainsRouter = Router();

captainsRouter.get('/', async (_req, res) => {
  const captains = await Captain.find().sort({ createdAt: -1 });
  res.json(captains);
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
