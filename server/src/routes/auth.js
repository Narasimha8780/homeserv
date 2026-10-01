import { Router } from 'express';
import { Otp } from '../models/Otp.js';
import { Captain } from '../models/Captain.js';
import { normalizePhone } from '../utils/phone.js';
import { consumeOtp } from '../utils/otpVerify.js';

export const authRouter = Router();

const OTP_TTL_MS = 5 * 60 * 1000;

// MOCK MODE: no real SMS is sent. The generated code is returned directly in the
// API response so the frontend can display it for testing. To go live with a real
// provider (Twilio, MSG91, etc.): call that provider's send-SMS API here instead,
// and stop returning `mockOtp` in the response below.
authRouter.post('/send-otp', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (phone.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await Otp.findByIdAndUpdate(
    phone,
    { code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    { upsert: true }
  );

  res.json({ success: true, mockOtp: code });
});

authRouter.post('/verify-otp', async (req, res) => {
  const { ok, phone } = await consumeOtp(req.body.phone, req.body.code);
  if (!ok) return res.status(400).json({ error: 'Invalid or expired OTP' });

  const captain = await Captain.findOne({ phoneNormalized: phone });
  res.json({ verified: true, captain: captain || null });
});
