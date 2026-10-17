import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import mongoose from 'mongoose';
import { Category } from '../src/models/Category.js';
import { SERVICE_CATEGORIES } from '../src/data/serviceCategories.js';
import { ensureServiceCategories } from '../src/utils/ensureServiceCategories.js';

const referenceIds = [
  'driver', 'plumber', 'electrician', 'insta-help', 'saree-draping',
  'mehendi-service', 'pest-control', 'carpenter', 'spa', 'interior',
  'painter', 'home-cleaning', 'bridal-makeup', 'photography', 'events',
];

test('complete services without losing existing data', { skip: !process.env.MONGODB_TEST_URI }, async (t) => {
  // Always use an isolated, disposable database, never the application's database.
  const connection = await mongoose.createConnection(process.env.MONGODB_TEST_URI, {
    dbName: `homeserv_category_test_${process.pid}_${Date.now()}`,
  }).asPromise();
  const Model = connection.model('Category', Category.schema);
  try {
    await t.test('adds exactly five missing reference services and retains repair categories', async () => {
      const initialIds = [...referenceIds.slice(0, 10), 'ac-repair', 'appliance-repair', 'men-spa'];
      await Model.insertMany(SERVICE_CATEGORIES.filter(({ id }) => initialIds.includes(id))
        .map(({ id, ...fields }) => ({ _id: id, ...fields })));
      await ensureServiceCategories(Model);
      assert.equal(await Model.countDocuments(), SERVICE_CATEGORIES.length);
      assert.equal(await Model.countDocuments({ _id: { $in: referenceIds } }), 15);
    });
    await t.test('repeated startup preserves customized and disabled categories', async () => {
      await Model.updateOne({ _id: 'events' }, { title: 'Custom Events', isActive: false, tagline: 'Keep this' });
      const before = await Model.find().sort({ _id: 1 }).lean();
      await ensureServiceCategories(Model);
      await ensureServiceCategories(Model);
      assert.deepEqual(await Model.find().sort({ _id: 1 }).lean(), before);
    });
    await t.test('recognizes existing admin IDs and common name variants', async () => {
      await Model.deleteMany({ _id: { $in: ['spa', 'mehendi-service', 'painter'] } });
      await Model.insertMany([
        { _id: 'women-s-spa', title: "Women's Spa", iconName: 'Flower2', isActive: false },
        { _id: 'mehndi', title: 'Mehndi Service', iconName: 'Hand' },
        { _id: 'painters', title: 'Painters', iconName: 'Paintbrush' },
      ]);
      await ensureServiceCategories(Model);
      assert.equal(await Model.countDocuments(), SERVICE_CATEGORIES.length);
      assert.equal(await Model.countDocuments({ _id: { $in: ['spa', 'mehendi-service', 'painter'] } }), 0);
      assert.equal((await Model.findById('women-s-spa')).isActive, false);
    });
    await t.test('renames legacy spa categories while preserving IDs and settings', async () => {
      await Model.deleteMany({});
      await Model.insertMany([
        { _id: 'women_spa', title: 'Women Spa', iconName: 'Flower2', isActive: false, tagline: 'Keep women details' },
        { _id: 'men_spa', title: 'Men Spa', iconName: 'Scissors', isActive: false, tagline: 'Keep men details' },
      ]);
      const captains = connection.collection('captains');
      await captains.insertOne({ _id: 'existing-captain', categories: ['women_spa', 'men_spa'] });
      await ensureServiceCategories(Model);
      assert.equal((await Model.findById('women_spa')).title, 'Beauty & Personal Care');
      assert.equal((await Model.findById('men_spa')).title, "Men's Saloon");
      for (const id of ['women_spa', 'men_spa']) assert.equal((await Model.findById(id)).isActive, false);
      assert.equal((await Model.findById('women_spa')).tagline, 'Keep women details');
      assert.equal((await Model.findById('men_spa')).tagline, 'Keep men details');
      assert.equal(await Model.countDocuments({ _id: { $in: ['spa', 'men-spa'] } }), 0);
      assert.equal(await Model.countDocuments(), SERVICE_CATEGORIES.length);
      assert.deepEqual((await captains.findOne({ _id: 'existing-captain' })).categories, ['women_spa', 'men_spa']);
      const before = await Model.find().sort({ _id: 1 }).lean();
      await ensureServiceCategories(Model);
      assert.deepEqual(await Model.find().sort({ _id: 1 }).lean(), before);
    });
    await t.test('renames title variants and reuses already branded categories', async () => {
      await Model.deleteMany({});
      await Model.insertMany([
        { _id: 'custom-women', title: "Women's Spa", iconName: 'Flower2' },
        { _id: 'custom-men', title: "Men's Salon", iconName: 'Scissors' },
      ]);
      await ensureServiceCategories(Model);
      assert.equal((await Model.findById('custom-women')).title, 'Beauty & Personal Care');
      assert.equal((await Model.findById('custom-men')).title, "Men's Saloon");
      assert.equal(await Model.countDocuments(), SERVICE_CATEGORIES.length);
      await ensureServiceCategories(Model);
      assert.equal(await Model.countDocuments(), SERVICE_CATEGORIES.length);
    });
    await t.test('initializes all services in an empty database', async () => {
      await Model.deleteMany({});
      await ensureServiceCategories(Model);
      assert.equal(await Model.countDocuments(), SERVICE_CATEGORIES.length);
      for (const id of referenceIds) assert.ok(await Model.findById(id), id);
    });
    await t.test('API startup fills missing categories before serving them', async () => {
      await Model.deleteMany({ _id: { $in: referenceIds.slice(10) } });
      const uri = new URL(process.env.MONGODB_TEST_URI);
      uri.pathname = `/${connection.name}`;
      const child = spawn(process.execPath, ['src/index.js'], {
        cwd: new URL('../', import.meta.url),
        env: { ...process.env, MONGODB_URI: uri.toString(), PORT: '4091' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const exited = once(child, 'exit');
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('API did not become ready')), 10000);
          child.stdout.on('data', (chunk) => {
            if (chunk.toString().includes('HomeServ API listening')) {
              clearTimeout(timeout);
              resolve();
            }
          });
          child.once('exit', (code) => {
            clearTimeout(timeout);
            reject(new Error(`API exited before readiness: ${code}`));
          });
          child.once('error', reject);
        });
        const health = await fetch('http://127.0.0.1:4091/api/health');
        assert.deepEqual(await health.json(), { ok: true });
        const response = await fetch('http://127.0.0.1:4091/api/categories');
        assert.equal(response.status, 200);
        const categories = await response.json();
        for (const id of referenceIds) assert.ok(categories.some((category) => category.id === id), id);
        assert.equal(categories.length, SERVICE_CATEGORIES.length);
        assert.equal(categories.find(({ id }) => id === 'spa').title, 'Beauty & Personal Care');
        assert.equal(categories.find(({ id }) => id === 'men-spa').title, "Men's Saloon");
      } finally {
        child.kill('SIGTERM');
        await exited;
      }
    });

  } finally {
    await connection.dropDatabase();
    await connection.close();
  }
});
