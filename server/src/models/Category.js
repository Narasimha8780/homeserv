import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: { type: String, required: true },
    iconName: { type: String, required: true },
    tagline: { type: String, default: '' },
    color: { type: String, default: 'from-slate-500 to-slate-700' },
    isActive: { type: Boolean, default: true },
  },
  { versionKey: false }
);

categorySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const Category = mongoose.model('Category', categorySchema);
