import { Router } from 'express';
import { City } from '../models/City.js';

export const citiesRouter = Router();

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

citiesRouter.get('/', async (_req, res) => {
  const cities = await City.find().sort({ order: 1 });
  res.json(cities);
});

// Self-serve: customers/captains can add a city that isn't listed yet for their state.
// Returns the existing city instead of creating a duplicate if one already matches.
citiesRouter.post('/', async (req, res) => {
  const { name, state } = req.body;
  if (!name || !state || !name.trim() || !state.trim()) {
    return res.status(400).json({ error: 'name and state are required' });
  }

  const id = `${slugify(name)}-${slugify(state)}`;
  if (!id) return res.status(400).json({ error: 'Invalid city name' });

  let city = await City.findById(id);
  if (!city) {
    const last = await City.findOne().sort({ order: -1 }).select('order');
    city = await City.create({
      _id: id,
      name: name.trim(),
      state: state.trim(),
      population: 'N/A',
      tier: 'Semi-Urban',
      isActive: true,
      order: (last?.order || 0) + 1,
    });
  }
  res.status(201).json(city);
});
