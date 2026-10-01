import { Router } from 'express';
import { City } from '../models/City.js';

export const citiesRouter = Router();

citiesRouter.get('/', async (_req, res) => {
  const cities = await City.find().sort({ order: 1 });
  res.json(cities);
});
