import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    _id: { type: String },
    captainId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    date: { type: String, required: true },
  },
  { versionKey: false }
);

reviewSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const Review = mongoose.model('Review', reviewSchema);
