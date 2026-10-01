import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    state: { type: String, required: true },
    population: { type: String, required: true },
    tier: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { versionKey: false }
);

citySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.order;
  },
});

export const City = mongoose.model('City', citySchema);
