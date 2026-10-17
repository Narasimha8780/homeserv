import { SERVICE_CATEGORIES } from '../data/serviceCategories.js';

const normalize = (value) => String(value).toLowerCase().replace(/[^a-z]/g, '');
const aliases = {
  painter: ['Painters'],
  spa: ['Women Spa', "Women's Spa", 'Womens Spa', 'Women Salon', 'Ladies Spa', 'Beauty and Personal Care'],
  'men-spa': ['Men Spa', "Men's Spa", 'Mens Spa', 'Men Salon', "Men's Saloon", 'Mens Salon', 'Men Saloon', 'Mens Saloon', 'Barber'],
  'ac-repair': ['AC Repair', 'AC & Appliance Repair', 'Air Conditioner Repair'],
  'mehendi-service': ['Mehndi Service', 'Mehendi Service', 'Mehendi', 'Mehndi', 'Henna'],
  'saree-draping': ['Sari Draping', 'Saree Draping', 'Saree Drapping'],
  'bridal-makeup': ['Bridal Makeup'],
};
const renamed = new Set(['spa', 'men-spa', 'ac-repair', 'saree-draping', 'mehendi-service', 'bridal-makeup']);
const parents = {
  'saree-draping': 'spa',
  'mehendi-service': 'spa',
  'bridal-makeup': 'spa',
  'appliance-repair': 'ac-repair',
};

function matches(category, definition) {
  const names = [definition.id, definition.title, ...(aliases[definition.id] || [])].map(normalize);
  return names.includes(normalize(category._id)) || names.includes(normalize(category.title));
}

// Keep existing IDs, professional references, active settings and custom fields.
// Rename the requested categories and move existing child categories under their
// actual parent IDs (including admin-created legacy IDs such as women_spa).
export async function ensureServiceCategories(Category) {
  const existing = await Category.find({}, { _id: 1, title: 1, parentId: 1 }).lean();
  const operations = [];
  for (const category of existing) {
    const definition = SERVICE_CATEGORIES.find((service) => renamed.has(service.id) && matches(category, service));
    if (definition && category.title !== definition.title) {
      operations.push({ updateOne: {
        filter: { _id: category._id, title: category.title },
        update: { $set: { title: definition.title } },
      } });
      category.title = definition.title;
    }
  }
  const parentIdFor = (key) => {
    const definition = SERVICE_CATEGORIES.find(({ id }) => id === key);
    return existing.find((category) => matches(category, definition))?._id || key;
  };
  for (const category of existing) {
    const child = SERVICE_CATEGORIES.find((service) => parents[service.id] && matches(category, service));
    if (!child) continue;
    const parentId = parentIdFor(parents[child.id]);
    if (category.parentId !== parentId) {
      operations.push({ updateOne: { filter: { _id: category._id }, update: { $set: { parentId } } } });
    }
  }
  const missing = SERVICE_CATEGORIES.filter((definition) => !existing.some((category) => matches(category, definition)));
  operations.push(...missing.map(({ id, ...category }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $setOnInsert: {
        ...category,
        ...(parents[id] ? { parentId: parentIdFor(parents[id]) } : {}),
      } },
      upsert: true,
    },
  })));
  if (operations.length) await Category.bulkWrite(operations);
}
