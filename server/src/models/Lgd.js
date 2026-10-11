import mongoose from 'mongoose';

// Official Local Government Directory (LGD) hierarchy: state -> district -> sub-district
// (tehsil / taluk / mandal) -> village. _id is the LGD code. `n` is the normalised name used
// for prefix search. Loaded by src/importLgd.js; never edited by the app.

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const hideInternals = {
  transform: (_doc, ret) => {
    ret.code = ret._id;
    delete ret._id;
    delete ret.n;
    delete ret.location;
  },
};

const stateSchema = new mongoose.Schema(
  { _id: Number, name: { type: String, required: true }, lgdName: String },
  { versionKey: false, toJSON: hideInternals }
);

const districtSchema = new mongoose.Schema(
  {
    _id: Number,
    name: { type: String, required: true },
    n: { type: String, required: true },
    s: { type: Number, required: true, index: true },
    location: { type: pointSchema, default: undefined },
    approx: { type: Boolean, default: false },
  },
  { versionKey: false, toJSON: hideInternals }
);
districtSchema.index({ s: 1, n: 1 });

const subdistrictSchema = new mongoose.Schema(
  {
    _id: Number,
    name: { type: String, required: true },
    n: { type: String, required: true },
    d: { type: Number, required: true, index: true },
    s: { type: Number, required: true },
    location: { type: pointSchema, default: undefined },
    approx: { type: Boolean, default: false },
  },
  { versionKey: false, toJSON: hideInternals }
);
subdistrictSchema.index({ s: 1, n: 1 });
subdistrictSchema.index({ location: '2dsphere' });

const villageSchema = new mongoose.Schema(
  {
    _id: Number,
    name: { type: String, required: true },
    n: { type: String, required: true },
    sd: { type: Number, required: true },
    d: { type: Number, required: true },
    s: { type: Number, required: true },
  },
  { versionKey: false, toJSON: hideInternals }
);
villageSchema.index({ s: 1, n: 1 });
villageSchema.index({ sd: 1, n: 1 });
villageSchema.index({ n: 1 });

export const LgdState = mongoose.model('LgdState', stateSchema, 'lgd_states');
export const LgdDistrict = mongoose.model('LgdDistrict', districtSchema, 'lgd_districts');
export const LgdSubdistrict = mongoose.model('LgdSubdistrict', subdistrictSchema, 'lgd_subdistricts');
export const LgdVillage = mongoose.model('LgdVillage', villageSchema, 'lgd_villages');
export { pointSchema };
