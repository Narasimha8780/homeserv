import mongoose from 'mongoose';
import { pointSchema } from './Lgd.js';

const citySchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    state: { type: String, required: true },
    // Set for places picked from the official LGD list (villages/tehsils share names a lot).
    district: { type: String },
    population: { type: String, required: true },
    tier: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Approximate centre, used to find the nearest city to a GPS position.
    location: { type: pointSchema, default: undefined },
  },
  { versionKey: false }
);

citySchema.index({ location: '2dsphere' });

citySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.order;
    delete ret.location;
  },
});

export const City = mongoose.model('City', citySchema);
