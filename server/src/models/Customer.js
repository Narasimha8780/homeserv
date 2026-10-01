import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    phoneNormalized: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, versionKey: false }
);

customerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.phoneNormalized;
  },
});

export const Customer = mongoose.model('Customer', customerSchema);
