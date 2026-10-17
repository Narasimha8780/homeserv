import { SERVICE_CATEGORIES } from '../data/serviceCategories.js';

const normalize = (value) => String(value).toLowerCase().replace(/[^a-z]/g, '');
const aliases = {
  painter: ['Painters'],
  spa: ['Women Spa', "Women's Spa", 'Womens Spa', 'Women Salon', 'Ladies Spa'],
  'men-spa': ['Men Spa', "Men's Spa", 'Mens Spa', 'Men Salon', "Men's Salon", 'Mens Salon', 'Men Saloon', 'Mens Saloon', 'Barber'],
  'mehendi-service': ['Mehndi Service', 'Mehendi', 'Mehndi', 'Henna'],
  'saree-draping': ['Sari Draping'],
};

const branding = [
  { id: 'spa', title: 'Beauty & Personal Care', names: ['Beauty and Personal Care'] },
  { id: 'men-spa', title: "Men's Saloon", names: [] },
];

// Keep existing IDs and settings so professional listings remain linked. Rename
// only the requested spa categories, and insert any missing default services.
export async function ensureServiceCategories(Category) {
  const existing = await Category.find({}, { _id: 1, title: 1 }).lean();
  const operations = [];
  for (const category of existing) {
    for (const rule of branding) {
      const names = [rule.id, rule.title, ...rule.names, ...aliases[rule.id]].map(normalize);
      if (names.includes(normalize(category._id)) || names.includes(normalize(category.title))) {
        if (category.title !== rule.title) {
          operations.push({ updateOne: {
            filter: { _id: category._id, title: category.title },
            update: { $set: { title: rule.title } },
          } });
        }
        // Use the new title for duplicate detection without changing the ID.
        category.title = rule.title;
        break;
      }
    }
  }
  const known = new Set(existing.flatMap((category) => [normalize(category._id), normalize(category.title)]));
  const missing = SERVICE_CATEGORIES.filter(({ id, title }) =>
    ![id, title, ...(aliases[id] || [])].some((name) => known.has(normalize(name)))
  );
  operations.push(...missing.map(({ id, ...category }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $setOnInsert: category },
      upsert: true,
    },
  })));
  if (operations.length) await Category.bulkWrite(operations);
}
