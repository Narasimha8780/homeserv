import mongoose from 'mongoose';

// A short-lived receipt proving phone.email verified a number. The client gets the
// token and sends it back when signing up or resetting a PIN, so the phone number
// always comes from the verification rather than from a form field the client
// could change.
const phoneVerificationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    phoneNormalized: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

phoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PhoneVerification = mongoose.model('PhoneVerification', phoneVerificationSchema);
