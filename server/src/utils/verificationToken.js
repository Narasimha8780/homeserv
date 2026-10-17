import { randomBytes } from 'node:crypto';
import { PhoneVerification } from '../models/PhoneVerification.js';

// A short-lived, one-time receipt that a phone number was just verified by OTP.
// Signup and PIN-reset routes take this token instead of a phone number, so the
// number they act on is always one the server verified — never one the client
// simply typed into the request.
const VERIFICATION_TTL_MS = 10 * 60 * 1000;

export async function issueVerificationToken(phoneNormalized) {
  const token = randomBytes(24).toString('hex');
  await PhoneVerification.create({
    _id: token,
    phoneNormalized,
    expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
  });
  return token;
}

// One-time use: the token is deleted as it is redeemed.
export async function redeemVerificationToken(token) {
  const doc = await PhoneVerification.findById(String(token || ''));
  if (!doc || doc.expiresAt < new Date()) return null;
  await PhoneVerification.deleteOne({ _id: doc._id });
  return doc.phoneNormalized;
}
