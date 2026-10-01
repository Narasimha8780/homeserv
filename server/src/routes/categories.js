import { Router } from 'express';
import { Category } from '../models/Category.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

categoriesRouter.post('/', async (req, res) => {
  const { title, iconName } = req.body;
  if (!title || !iconName) {
    return res.status(400).json({ error: 'title and iconName are required' });
  }
  const id = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const existing = await Category.findById(id);
  if (existing) {
    return res.status(409).json({ error: 'A category with this name already exists' });
  }
  const category = await Category.create({
    _id: id,
    title,
    iconName,
    tagline: 'New category',
    color: 'from-slate-500 to-slate-700',
    isActive: true,
  });
  res.status(201).json(category);
});

categoriesRouter.patch('/:id/toggle', async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  category.isActive = !category.isActive;
  await category.save();
  res.json(category);
});
