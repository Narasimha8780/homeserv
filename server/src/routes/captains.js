import { Router } from 'express';
import { Captain } from '../models/Captain.js';

export const captainsRouter = Router();

captainsRouter.get('/', async (_req, res) => {
  const captains = await Captain.find().sort({ createdAt: -1 });
  res.json(captains);
});

captainsRouter.post('/', async (req, res) => {
  const {
    name, phone, whatsapp, avatar, cityId, areas, categories,
    experienceYears, bio, languages, startingPrice,
  } = req.body;

  if (!name || !phone || !cityId || !categories?.length || !areas?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = `cap-${Date.now()}`;
  const captain = await Captain.create({
    _id: id,
    name,
    phone,
    whatsapp,
    avatar,
    cityId,
    areas,
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
