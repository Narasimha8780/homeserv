import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { createServer } from 'vite';

// Load through Vite so the test exercises the real asset glob and URL mapping.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { getCategoryIconUrl, ALL_CATEGORIES_ICON_URL } = await server.ssrLoadModule('/src/utils/categoryIcons.ts');
  const services = [
    ['driver', 'Driver'], ['plumber', 'Plumber'], ['electrician', 'Electrician'],
    ['insta-help', 'Insta Help'], ['saree-draping', 'Saree Draping'],
    ['mehendi-service', 'Mehendi Service'], ['pest-control', 'Pest Control'],
    ['carpenter', 'Carpenter'], ['spa', 'Women Spa'], ['interior', 'Interior'],
    ['painter', 'Painters'], ['home-cleaning', 'Home Cleaning'],
    ['bridal-makeup', 'Bridal Makeup'], ['photography', 'Photography'], ['events', 'Events'],
  ];
  for (const [id, title] of services) {
    const url = getCategoryIconUrl(id);
    assert.ok(url, `${id} must have artwork`);
    await access(new URL(`../src/assets/category-icons/${id}.png`, import.meta.url));
    assert.equal(getCategoryIconUrl('custom-category', title), url, `${title} should resolve by title`);
  }
  for (const [title, id] of [
    ["Women's Spa", 'spa'], ['Mehndi Artist', 'mehendi-service'],
    ['Sari Draping', 'saree-draping'], ["Women's Bridal Makeup", 'bridal-makeup'],
    ['Men’s Haircut', 'barber'], ['Housekeeping', 'home-cleaning'],
  ]) {
    assert.equal(getCategoryIconUrl('custom-category', title), getCategoryIconUrl(id), title);
  }
  assert.ok(ALL_CATEGORIES_ICON_URL);
  assert.ok(getCategoryIconUrl('ac-repair'));
  assert.ok(getCategoryIconUrl('appliance-repair'));
  assert.equal(getCategoryIconUrl('unknown', 'Masonry'), undefined);
  assert.equal(getCategoryIconUrl('unknown', 'Human Resources'), undefined);
  assert.equal(new Set(services.map(([id]) => getCategoryIconUrl(id))).size, 15);
  console.log('Passed: 15 distinct service assets, title aliases, retained icons, and unknown-category fallback.');
} finally {
  await server.close();
}
