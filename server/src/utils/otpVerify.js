import { timingSafeEqual } from 'node:crypto';
import { Otp } from '../models/Otp.js';
import { normalizePhone } from './phone.js';

// A 6-digit code is only a million possibilities. Without a cap, a script could
// guess it inside the 5-minute window — and a correct guess on the PIN-reset path
// is an account takeover. After this many wrong tries the code is discarded and a
// fresh one has to be requested.
export const MAX_OTP_ATTEMPTS = 5;

const sameCode = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

// Checks a phone+code pair against the stored OTP and consumes it (one-time use).
export async function consumeOtp(phoneRaw, codeRaw) {
  const phone = normalizePhone(phoneRaw);
  const code = String(codeRaw || '').trim();

  const otp = await Otp.findById(phone);
  if (!otp || otp.expiresAt < new Date()) {
    return { ok: false, phone, reason: 'expired' };
  }

  if (!sameCode(otp.code, code)) {
    const attempts = (otp.attempts || 0) + 1;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ _id: phone });
      return { ok: false, phone, reason: 'locked' };
    }
    await Otp.updateOne({ _id: phone }, { attempts });
    return { ok: false, phone, reason: 'wrong', attemptsLeft: MAX_OTP_ATTEMPTS - attempts };
  }

  await Otp.deleteOne({ _id: phone });
  return { ok: true, phone };
}
