import { normalizePhone } from './phone.js';
import { verifyPin, lockoutRemainingMs, lockoutMessage, MAX_ATTEMPTS, LOCKOUT_MS } from './pin.js';

// One PIN sign-in implementation shared by customers and captains: same lockout
// rules, and the same deliberately vague error when the account doesn't exist so
// the response can't be used to find out which numbers are registered.
export async function signInWithPin(Model, phoneRaw, pin) {
  const phoneNormalized = normalizePhone(phoneRaw);
  if (phoneNormalized.length !== 10) {
    return { error: 'Enter a valid 10-digit phone number', status: 400 };
  }

  const doc = await Model.findOne({ phoneNormalized });
  if (!doc || !doc.pinHash) {
    return { error: 'Wrong number or PIN', status: 401 };
  }

  const remaining = lockoutRemainingMs(doc);
  if (remaining > 0) {
    return { error: lockoutMessage(remaining), status: 429 };
  }

  if (!(await verifyPin(pin, doc.pinHash))) {
    doc.failedAttempts = (doc.failedAttempts || 0) + 1;
    if (doc.failedAttempts >= MAX_ATTEMPTS) {
      doc.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
      doc.failedAttempts = 0;
      await doc.save();
      return { error: lockoutMessage(LOCKOUT_MS), status: 429 };
    }
    await doc.save();
    const left = MAX_ATTEMPTS - doc.failedAttempts;
    return { error: `Wrong PIN. ${left} attempt${left === 1 ? '' : 's'} left.`, status: 401 };
  }

  if (doc.failedAttempts || doc.lockedUntil) {
    doc.failedAttempts = 0;
    doc.lockedUntil = undefined;
    await doc.save();
  }
  return { doc };
}
