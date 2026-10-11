import { Router } from 'express';
import { City } from '../models/City.js';
import { locateByName, resolveLgdPlace } from '../utils/lgd.js';

export const citiesRouter = Router();

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

citiesRouter.get('/', async (_req, res) => {
  const cities = await City.find().sort({ order: 1 });
  res.json(cities);
});

// Self-serve: customers/captains can add a place that isn't listed yet. Either an official LGD
// place picked from search ({ lgd: { type, code } }) or a typed name + state. Returns the
// existing city instead of creating a duplicate if one already matches.
citiesRouter.post('/', async (req, res) => {
  let { name, state } = req.body;
  let location;
  let district;

  if (req.body.lgd) {
    const place = await resolveLgdPlace(req.body.lgd.type, req.body.lgd.code);
    if (!place?.state) return res.status(400).json({ error: 'Unknown place' });
    ({ name, state, district, location } = place);
  }

  if (!name || !state || !String(name).trim() || !String(state).trim()) {
    return res.status(400).json({ error: 'name and state are required' });
  }
  name = String(name).trim();
  state = String(state).trim();

  // Villages and tehsils often share a name within a state, so LGD places below district
  // level include their district in the id.
  const id = [name, district, state].filter(Boolean).map(slugify).join('-');
  if (!id) return res.status(400).json({ error: 'Invalid city name' });

  if (!location) location = (await locateByName(name, state).catch(() => null))?.location;

  let city = await City.findById(id);
  if (!city) {
    const last = await City.findOne().sort({ order: -1 }).select('order');
    city = await City.create({
      _id: id,
      name,
      state,
      ...(district ? { district } : {}),
      population: 'N/A',
      tier: 'Tier 3',
      isActive: true,
      order: (last?.order || 0) + 1,
      ...(location ? { location } : {}),
    });
  } else if (!city.location && location) {
    city.location = location;
    await city.save();
  }
  res.status(201).json(city);
});

// Admin-only: hide/restore a city from customer & captain pickers without deleting it
// (deactivating rather than deleting keeps any captains already using this city intact).
citiesRouter.patch('/:id/toggle', async (req, res) => {
  const city = await City.findById(req.params.id);
  if (!city) return res.status(404).json({ error: 'City not found' });
  city.isActive = !city.isActive;
  await city.save();
  res.json(city);
});
