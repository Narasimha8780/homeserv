// Imports the official LGD list of states, districts, sub-districts and villages into MongoDB
// and gives every city an approximate location (used for "Detect my city").
//
//   node src/importLgd.js <path-to-lgd.csv>        (or: npm run import:lgd -- <path>)
//
// CSV columns: state_code,state_name,district_code,district_name,sub-district_code,
// sub-district_name,village_code,village_name — e.g. the Dataful / lgdirectory.gov.in export.
// Safe to re-run: data is loaded into temporary collections and swapped in at the end, so the
// app keeps working during the import. Uses MONGODB_URI like the API server.
import 'dotenv/config';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { City } from './models/City.js';
import { LgdDistrict, LgdState, LgdSubdistrict, LgdVillage } from './models/Lgd.js';
import { migrateCaptainAreas } from './migrateCaptainAreas.js';
import { appStateName, clearStateCache, displayName, geoFor, locateByName, normName, toPoint } from './utils/lgd.js';

const COLUMNS = ['state_code', 'state_name', 'district_code', 'district_name', 'sub-district_code', 'sub-district_name', 'village_code', 'village_name'];
const BATCH = 5000;

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function withGeo(level, code) {
  const g = geoFor(level, code);
  return g ? { location: toPoint(g), approx: g[2] === 1 } : {};
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node src/importLgd.js <path-to-lgd.csv>');
    process.exit(1);
  }

  await connectDB();
  const db = mongoose.connection.db;
  const tmp = (model) => `${model.collection.collectionName}__import`;
  for (const model of [LgdState, LgdDistrict, LgdSubdistrict, LgdVillage]) {
    await db.collection(tmp(model)).drop().catch(() => {});
  }

  const states = new Map();
  const districts = new Map();
  const subdistricts = new Map();
  const villages = db.collection(tmp(LgdVillage));
  let batch = [];
  let villageCount = 0;
  let idx = null;

  const lines = createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const rawLine of lines) {
    const line = rawLine.replace(/^﻿/, '');
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (!idx) {
      idx = Object.fromEntries(COLUMNS.map((c) => [c, cols.indexOf(c)]));
      const missing = COLUMNS.filter((c) => idx[c] < 0);
      if (missing.length) throw new Error(`CSV is missing columns: ${missing.join(', ')}`);
      continue;
    }
    const get = (c) => cols[idx[c]].trim();
    const s = Number(get('state_code'));
    const d = Number(get('district_code'));
    const sd = Number(get('sub-district_code'));

    if (!states.has(s)) {
      states.set(s, { _id: s, name: appStateName(get('state_name')), lgdName: get('state_name') });
    }
    if (!districts.has(d)) {
      districts.set(d, { _id: d, name: displayName(get('district_name')), n: normName(get('district_name')), s, ...withGeo('district', d) });
    }
    if (!subdistricts.has(sd)) {
      subdistricts.set(sd, { _id: sd, name: displayName(get('sub-district_name')), n: normName(get('sub-district_name')), d, s, ...withGeo('subdistrict', sd) });
    }
    batch.push({ _id: Number(get('village_code')), name: displayName(get('village_name')), n: normName(get('village_name')), sd, d, s });
    if (batch.length >= BATCH) {
      await villages.insertMany(batch, { ordered: false });
      villageCount += batch.length;
      batch = [];
      if (villageCount % 100000 === 0) console.log(`  …${villageCount.toLocaleString('en-IN')} villages`);
    }
  }
  if (batch.length) {
    await villages.insertMany(batch, { ordered: false });
    villageCount += batch.length;
  }

  await db.collection(tmp(LgdState)).insertMany([...states.values()]);
  await db.collection(tmp(LgdDistrict)).insertMany([...districts.values()]);
  await db.collection(tmp(LgdSubdistrict)).insertMany([...subdistricts.values()]);

  // Swap the fresh data in, then (re)build indexes.
  for (const model of [LgdState, LgdDistrict, LgdSubdistrict, LgdVillage]) {
    await db.collection(tmp(model)).rename(model.collection.collectionName, { dropTarget: true });
    await model.syncIndexes();
  }
  clearStateCache();
  console.log(
    `Imported ${states.size} states, ${districts.size} districts, ${subdistricts.size} sub-districts, ${villageCount.toLocaleString('en-IN')} villages.`
  );

  // Give every city a location so it can be found by GPS.
  await City.syncIndexes();
  const cities = await City.find();
  let located = 0;
  const unlocated = [];
  for (const city of cities) {
    const found = await locateByName(city.name, city.state);
    if (found) {
      city.location = found.location;
      await city.save();
      located++;
    } else {
      unlocated.push(`${city.name} (${city.state})`);
    }
  }
  console.log(`Cities with a location: ${located}/${cities.length}`);
  if (unlocated.length) console.log(`No location found for: ${unlocated.join(', ')}`);

  // Captains registered with only a city get that city's district as their service area.
  await migrateCaptainAreas();

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('LGD import failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
