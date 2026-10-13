import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);
const KEY_LEN = 64;

// PINs people pick when they aren't thinking — a 4-digit space is small enough
// that these alone would account for a large share of accounts.
const WEAK_PINS = new Set([
  '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
  '1234', '2345', '3456', '4567', '5678', '6789', '0123',
  '4321', '5432', '6543', '7654', '8765', '9876', '3210',
  '1212', '2121', '1122', '6969', '1313', '2580',
]);

export function validatePin(pin) {
  const value = String(pin || '').trim();
  if (!/^\d{4}$/.test(value)) return 'PIN must be exactly 4 digits';
  if (WEAK_PINS.has(value)) return 'That PIN is too easy to guess — please choose another';
  return null;
}

// Stored as "salt:hash" so the salt travels with the hash and each PIN gets its own.
export async function hashPin(pin) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(String(pin), salt, KEY_LEN);
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPin(pin, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const derived = await scrypt(String(pin), salt, KEY_LEN);
  const expected = Buffer.from(hash, 'hex');
  // Constant-time compare so a wrong PIN can't be narrowed down by response timing.
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

// Shared guard for both customer and captain sign-in.
export function lockoutRemainingMs(doc) {
  if (!doc?.lockedUntil) return 0;
  return Math.max(0, doc.lockedUntil.getTime() - Date.now());
}

export function lockoutMessage(ms) {
  const minutes = Math.ceil(ms / 60000);
  return `Too many wrong PINs. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}
