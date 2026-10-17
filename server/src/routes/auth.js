import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { Otp } from '../models/Otp.js';
import { Captain } from '../models/Captain.js';
import { Customer } from '../models/Customer.js';
import { normalizePhone } from '../utils/phone.js';
import { consumeOtp } from '../utils/otpVerify.js';
import { sendWhatsappOtp, whatsappConfigured } from '../utils/whatsapp.js';
import { validatePin, hashPin } from '../utils/pin.js';
import { signInWithPin } from '../utils/pinAuth.js';
import { issueVerificationToken, redeemVerificationToken } from '../utils/verificationToken.js';

export const authRouter = Router();

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const modelFor = (role) => (role === 'captain' ? Captain : Customer);

// Step 1 of sign-up and PIN reset: send a one-time code to the number.
//
// Sends over WhatsApp when WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set.
// Otherwise it stays in MOCK MODE for local development: nothing is sent and the
// code is returned as `mockOtp` so the screen can show it.
//
// `purpose` lets us refuse before paying for a message that can't lead anywhere —
// a sign-up for a number that already has an account, or a reset for one that
// doesn't.
authRouter.post('/send-otp', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (phone.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }

  const { purpose, role } = req.body;
  if (purpose === 'signup' || purpose === 'reset') {
    const account = await modelFor(role).findOne({ phoneNormalized: phone });
    if (purpose === 'signup' && account?.pinHash) {
      return res.status(409).json({ error: 'This number is already registered. Please sign in instead.' });
    }
    if (purpose === 'reset' && !account) {
      return res.status(404).json({ error: 'No account found for this number.' });
    }
  }

  // Cooldown (live mode only) so a number — or a script — can't trigger paid
  // messages in a loop.
  const existing = await Otp.findById(phone);
  if (whatsappConfigured() && existing?.sentAt && Date.now() - existing.sentAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt.getTime())) / 1000);
    return res.status(429).json({ error: `Please wait ${wait}s before requesting another code.`, retryAfter: wait });
  }

  const code = String(randomInt(100000, 1000000));
  await Otp.findByIdAndUpdate(
    phone,
    { code, expiresAt: new Date(Date.now() + OTP_TTL_MS), sentAt: new Date(), attempts: 0 },
    { upsert: true }
  );

  if (!whatsappConfigured()) {
    return res.json({ success: true, mockOtp: code, resendAfter: 0 });
  }

  try {
    await sendWhatsappOtp(phone, code);
  } catch (err) {
    console.error(err.message);
    await Otp.deleteOne({ _id: phone });
    return res.status(502).json({ error: 'Could not send the code on WhatsApp. Please try again.' });
  }
  res.json({ success: true, resendAfter: RESEND_COOLDOWN_MS / 1000 });
});

// Step 2: check the code. On success the client gets a short-lived token, which
// sign-up and PIN reset take in place of a phone number.
authRouter.post('/otp/verify', async (req, res) => {
  const result = await consumeOtp(req.body.phone, req.body.code);
  if (!result.ok) {
    const error =
      result.reason === 'wrong'
        ? `Wrong code. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} left.`
        : result.reason === 'locked'
          ? 'Too many wrong attempts. Please request a new code.'
          : 'This code has expired. Please request a new one.';
    return res.status(400).json({ error, reason: result.reason });
  }

  const verificationToken = await issueVerificationToken(result.phone);
  res.json({ verificationToken, phone: result.phone });
});

// --- Captain PIN sign-in -----------------------------------------------------

authRouter.post('/captain/signin', async (req, res) => {
  const { error, status, doc } = await signInWithPin(Captain, req.body.phone, req.body.pin);
  if (error) return res.status(status).json({ error });
  res.json({ captain: doc });
});

// Sets a new PIN once the number has been verified by OTP.
authRouter.post('/captain/reset-pin', async (req, res) => {
  const phoneNormalized = await redeemVerificationToken(req.body.verificationToken);
  if (!phoneNormalized) {
    return res.status(400).json({ error: 'Verification expired. Please verify your number again.' });
  }

  const pinError = validatePin(req.body.pin);
  if (pinError) return res.status(400).json({ error: pinError });

  const captain = await Captain.findOne({ phoneNormalized });
  if (!captain) return res.status(404).json({ error: 'No captain account found for this number.' });

  captain.pinHash = await hashPin(req.body.pin);
  captain.failedAttempts = 0;
  captain.lockedUntil = undefined;
  await captain.save();
  res.json({ captain });
});

// Lets a signed-in person change their own PIN by proving the current one.
authRouter.post('/change-pin', async (req, res) => {
  const Model = modelFor(req.body.role);
  const { error, status, doc } = await signInWithPin(Model, req.body.phone, req.body.currentPin);
  if (error) return res.status(status).json({ error });

  const pinError = validatePin(req.body.newPin);
  if (pinError) return res.status(400).json({ error: pinError });

  doc.pinHash = await hashPin(req.body.newPin);
  await doc.save();
  res.json({ changed: true });
});
