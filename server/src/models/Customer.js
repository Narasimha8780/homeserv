import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    phoneNormalized: { type: String, required: true, unique: true, index: true },
    pinHash: { type: String },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, versionKey: false }
);

customerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.phoneNormalized;
    delete ret.pinHash;
    delete ret.failedAttempts;
    delete ret.lockedUntil;
  },
});

export const Customer = mongoose.model('Customer', customerSchema);
