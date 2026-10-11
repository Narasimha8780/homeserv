// One-time (safe to re-run): captains who registered with only a city get that city's whole
// district as their service area, so they show up for customers who pick a village/mandal.
//   npm run migrate:areas      (needs the LGD import first: npm run import:lgd -- <csv>)
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { Captain } from './models/Captain.js';
import { City } from './models/City.js';
import { LgdState } from './models/Lgd.js';
import { districtForCity } from './utils/serviceAreas.js';

export async function migrateCaptainAreas({ log = console.log } = {}) {
  const captains = await Captain.find({ $or: [{ serviceAreas: { $exists: false } }, { serviceAreas: { $size: 0 } }] });
  let done = 0;
  const skipped = [];
  for (const captain of captains) {
    const city = await City.findById(captain.cityId).lean();
    const district = city && (await districtForCity(city));
    if (!district) {
      skipped.push(`${captain.name} (${captain.cityId})`);
      continue;
    }
    const state = await LgdState.findById(district.s).lean();
    captain.serviceAreas = [
      { state: { code: state._id, name: state.name }, district: { code: district._id, name: district.name }, wholeDistrict: true, subdistricts: [] },
    ];
    await captain.save();
    done++;
  }
  log(`Captains given a service area: ${done}/${captains.length}`);
  if (skipped.length) log(`Could not place: ${skipped.join(', ')} — set their areas from the captain dashboard.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB()
    .then(() => migrateCaptainAreas())
    .then(() => mongoose.disconnect())
    .catch(async (err) => {
      console.error('Migration failed:', err);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    });
}
