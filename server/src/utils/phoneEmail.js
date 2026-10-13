import { randomBytes } from 'node:crypto';
import { PhoneVerification } from '../models/PhoneVerification.js';
import { normalizePhone } from './phone.js';

// phone.email hands the browser a URL and expects the backend to read the verified
// number from it. That URL arrives from the client, so it is only ever trusted when
// it points at phone.email's own host — otherwise anyone could point it at a server
// of their own and "verify" any number they liked.
const ALLOWED_HOST = 'user.phone.email';
const FETCH_TIMEOUT_MS = 10_000;
const VERIFICATION_TTL_MS = 10 * 60 * 1000;

function assertAllowedUrl(raw) {
  let url;
  try {
    url = new URL(String(raw || ''));
  } catch {
    throw new Error('Invalid verification link');
  }
  if (url.protocol !== 'https:' || url.hostname !== ALLOWED_HOST) {
    throw new Error('Invalid verification link');
  }
  return url;
}

// Fetches the verified identity and returns a one-time token the signup/reset
// routes exchange for the phone number.
export async function consumePhoneEmailUrl(userJsonUrl) {
  const url = assertAllowedUrl(userJsonUrl);

  const resp = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!resp.ok) throw new Error('Could not confirm your phone number. Please try again.');

  const data = await resp.json();
  const phoneNormalized = normalizePhone(
    `${data.user_country_code || ''}${data.user_phone_number || ''}`
  );
  if (phoneNormalized.length !== 10) {
    throw new Error('Only Indian mobile numbers are supported right now.');
  }

  const token = randomBytes(24).toString('hex');
  await PhoneVerification.create({
    _id: token,
    phoneNormalized,
    expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
  });

  return {
    token,
    phoneNormalized,
    firstName: String(data.user_first_name || '').trim(),
    lastName: String(data.user_last_name || '').trim(),
  };
}

// One-time use: the token is deleted as it is redeemed.
export async function redeemVerificationToken(token) {
  const doc = await PhoneVerification.findById(String(token || ''));
  if (!doc || doc.expiresAt < new Date()) return null;
  await PhoneVerification.deleteOne({ _id: doc._id });
  return doc.phoneNormalized;
}
