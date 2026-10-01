import { Otp } from '../models/Otp.js';
import { normalizePhone } from './phone.js';

// Checks a phone+code pair against the stored OTP and consumes it (one-time use).
// Shared by both the captain and customer verify-otp routes.
export async function consumeOtp(phoneRaw, codeRaw) {
  const phone = normalizePhone(phoneRaw);
  const code = String(codeRaw || '').trim();

  const otp = await Otp.findById(phone);
  if (!otp || otp.expiresAt < new Date() || otp.code !== code) {
    return { ok: false, phone };
  }
  await Otp.deleteOne({ _id: phone });
  return { ok: true, phone };
}
