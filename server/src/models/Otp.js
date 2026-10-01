import mongoose from 'mongoose';

// _id is the normalized phone number (last 10 digits) — one active OTP per phone.
// expiresAt has a TTL index so MongoDB auto-deletes it once it's no longer valid.
const otpSchema = new mongoose.Schema(
  {
    _id: { type: String },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model('Otp', otpSchema);
