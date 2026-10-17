import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import { SERVICE_CATEGORIES } from '../server/src/data/serviceCategories.js';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { SERVICE_SUBCATEGORIES, getServiceSubcategories } = await server.ssrLoadModule('/src/data/serviceSubcategories.ts');
  const { getSubcategoryIconUrl } = await server.ssrLoadModule('/src/utils/subcategoryIcons.ts');
  const { getRootCategories, getCategoryGroupIds } = await server.ssrLoadModule('/src/utils/categoryHierarchy.ts');
  const all = Object.values(SERVICE_SUBCATEGORIES).flat();
  assert.equal(all.length, 58);
  assert.equal(new Set(all.map(({ id }) => id)).size, all.length);
  const urls = new Set();
  const fingerprints = new Set();
  for (const { id } of all) {
    const url = getSubcategoryIconUrl(id);
    assert.ok(url, `${id} has a bundled asset`);
    urls.add(url);
    const png = await readFile(new URL(`../src/assets/subcategory-icons/${id}.png`, import.meta.url));
    assert.equal(png.readUInt32BE(16), 192, `${id} width`);
    assert.equal(png.readUInt32BE(20), 192, `${id} height`);
    fingerprints.add(createHash('sha256').update(png).digest('hex'));
  }
  assert.equal(urls.size, all.length, 'Each sub-service has its own image URL');
  assert.equal(fingerprints.size, all.length, 'Artwork files are distinct');
  assert.equal(getServiceSubcategories('spa').length, 10);
  assert.equal(getServiceSubcategories('ac-repair').length, 11);
  assert.equal(getServiceSubcategories('men_spa').length, 5);
  assert.equal(getServiceSubcategories('pest-control').length, 2);
  assert.equal(getServiceSubcategories('women_spa').length, 10);
  assert.equal(getServiceSubcategories('custom', 'AC & Appliance Repair').length, 11);
  assert.equal(getServiceSubcategories('custom', "Men's Salon").length, 5);
  assert.equal(getServiceSubcategories('custom', 'Beauty & Personal Care').length, 10);
  assert.equal(getServiceSubcategories('appliance-repair').length, 11);
  assert.deepEqual(getServiceSubcategories('custom', 'Masonry'), []);
  assert.deepEqual(getServiceSubcategories('all'), []);
  assert.ok(getServiceSubcategories('spa').some(({ title }) => title === 'Facials'));
  assert.ok(getServiceSubcategories('spa').some(({ title }) => title === 'Saree Draping / Pre-pleating'));

  const roots = getRootCategories(SERVICE_CATEGORIES);
  assert.equal(roots.length, 14);
  for (const id of ['saree-draping', 'mehendi-service', 'bridal-makeup', 'appliance-repair']) {
    assert.ok(!roots.some((category) => category.id === id), `${id} is nested`);
  }
  const beauty = SERVICE_CATEGORIES.find(({ id }) => id === 'spa');
  assert.deepEqual([...getCategoryGroupIds(beauty, SERVICE_CATEGORIES)], ['spa', 'saree-draping', 'mehendi-service', 'bridal-makeup']);
  const ac = SERVICE_CATEGORIES.find(({ id }) => id === 'ac-repair');
  assert.deepEqual([...getCategoryGroupIds(ac, SERVICE_CATEGORIES)], ['ac-repair', 'appliance-repair']);
  const withoutParents = SERVICE_CATEGORIES.map(({ parentId: _parentId, ...category }) => category);
  assert.equal(getRootCategories(withoutParents).length, 14, 'Old API responses also hide nested root tiles');
  const disabled = SERVICE_CATEGORIES.map((category) => category.id === 'saree-draping' ? { ...category, isActive: false } : category);
  assert.ok(!getCategoryGroupIds(beauty, disabled).has('saree-draping'));
  console.log('Passed: 58 distinct icons, reference service counts/names, aliases, 14 root groups, parent aggregation and legacy/inactive handling.');
} finally {
  await server.close();
}
