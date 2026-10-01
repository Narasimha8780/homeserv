import { Router } from 'express';
import { Review } from '../models/Review.js';
import { Captain } from '../models/Captain.js';

export const reviewsRouter = Router();

reviewsRouter.get('/', async (_req, res) => {
  const reviews = await Review.find().sort({ date: -1 });
  res.json(reviews);
});

reviewsRouter.post('/', async (req, res) => {
  const { captainId, customerName, rating, comment } = req.body;
  if (!captainId || !customerName || !rating) {
    return res.status(400).json({ error: 'captainId, customerName and rating are required' });
  }

  const captain = await Captain.findById(captainId);
  if (!captain) return res.status(404).json({ error: 'Captain not found' });

  const review = await Review.create({
    _id: `rev-${Date.now()}`,
    captainId,
    customerName: customerName.trim() || 'Anonymous',
    rating,
    comment: (comment || '').trim(),
    date: new Date().toISOString().split('T')[0],
  });

  const newCount = captain.reviewCount + 1;
  captain.rating = Number(((captain.rating * captain.reviewCount + rating) / newCount).toFixed(2));
  captain.reviewCount = newCount;
  await captain.save();

  res.status(201).json({ review, captain });
});
