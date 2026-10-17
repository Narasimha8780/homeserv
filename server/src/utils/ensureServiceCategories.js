import { SERVICE_CATEGORIES } from '../data/serviceCategories.js';

const normalize = (value) => String(value).toLowerCase().replace(/[^a-z]/g, '');
const aliases = {
  painter: ['Painters'],
  spa: ['Women Spa', "Women's Spa", 'Womens Spa', 'Women Salon', 'Ladies Spa'],
  'mehendi-service': ['Mehndi Service', 'Mehendi', 'Mehndi', 'Henna'],
  'saree-draping': ['Sari Draping'],
};

// Preserve admin-created IDs, customized fields and disabled categories. Only
// missing services are inserted; captain category references never change.
export async function ensureServiceCategories(Category) {
  const existing = await Category.find({}, { _id: 1, title: 1 }).lean();
  const known = new Set(existing.flatMap((category) => [normalize(category._id), normalize(category.title)]));
  const missing = SERVICE_CATEGORIES.filter(({ id, title }) =>
    ![id, title, ...(aliases[id] || [])].some((name) => known.has(normalize(name)))
  );
  if (!missing.length) return;

  await Category.bulkWrite(missing.map(({ id, ...category }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $setOnInsert: category },
      upsert: true,
    },
  })));
}
