import { Router } from 'express';
import { Otp } from '../models/Otp.js';
import { Captain } from '../models/Captain.js';
import { normalizePhone } from '../utils/phone.js';
import { consumeOtp } from '../utils/otpVerify.js';
import { sendWhatsappOtp, whatsappConfigured } from '../utils/whatsapp.js';
import { Customer } from '../models/Customer.js';
import { validatePin, hashPin } from '../utils/pin.js';
import { signInWithPin } from '../utils/pinAuth.js';
import { consumePhoneEmailUrl, redeemVerificationToken } from '../utils/phoneEmail.js';

export const authRouter = Router();

const OTP_TTL_MS = 5 * 60 * 1000;

const RESEND_COOLDOWN_MS = 60 * 1000;

// Sends the code over WhatsApp when WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set.
// Otherwise it stays in MOCK MODE: nothing is sent and the code is returned as `mockOtp`
// so the frontend can show it for testing.
authRouter.post('/send-otp', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (phone.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }

  // Cooldown (live mode only) so a number (or a script) can't trigger paid messages in a loop.
  const existing = await Otp.findById(phone);
  if (whatsappConfigured() && existing?.sentAt && Date.now() - existing.sentAt.getTime() < RESEND_COOLDOWN_MS) {
    return res.status(429).json({ error: 'Please wait a minute before requesting another code' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await Otp.findByIdAndUpdate(
    phone,
    { code, expiresAt: new Date(Date.now() + OTP_TTL_MS), sentAt: new Date() },
    { upsert: true }
  );

  if (!whatsappConfigured()) {
    return res.json({ success: true, mockOtp: code });
  }

  try {
    await sendWhatsappOtp(phone, code);
  } catch (err) {
    console.error(err.message);
    await Otp.deleteOne({ _id: phone });
    return res.status(502).json({ error: 'Could not send the code on WhatsApp. Please try again.' });
  }
  res.json({ success: true });
});

authRouter.post('/verify-otp', async (req, res) => {
  const { ok, phone } = await consumeOtp(req.body.phone, req.body.code);
  if (!ok) return res.status(400).json({ error: 'Invalid or expired OTP' });

  const captain = await Captain.findOne({ phoneNormalized: phone });
  res.json({ verified: true, captain: captain || null });
});

// --- Captain PIN sign-in -----------------------------------------------------

authRouter.post('/captain/signin', async (req, res) => {
  const { error, status, doc } = await signInWithPin(
    Captain,
    req.body.phone,
    req.body.pin,
  );
  if (error) return res.status(status).json({ error });
  res.json({ captain: doc });
});

authRouter.post('/captain/forgot-pin', async (req, res) => {
  const phoneNormalized = normalizePhone(req.body.phone);
  if (phoneNormalized.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }
  const captain = await Captain.findOne({ phoneNormalized });
  if (captain) {
    captain.pinResetRequestedAt = new Date();
    await captain.save();
  }
  res.json({ requested: true });
});

// --- Admin: PIN reset queue --------------------------------------------------
// The admin app is served from its own IAP-protected deployment, so these are
// reachable only through that service.

authRouter.get('/pin-resets', async (_req, res) => {
  const [customers, captains] = await Promise.all([
    Customer.find({ pinResetRequestedAt: { $ne: null } }).sort({ pinResetRequestedAt: -1 }),
    Captain.find({ pinResetRequestedAt: { $ne: null } }).sort({ pinResetRequestedAt: -1 }),
  ]);
  res.json({
    customers: customers.map((c) => ({
      id: c._id, name: c.name, phone: c.phone, requestedAt: c.pinResetRequestedAt,
    })),
    captains: captains.map((c) => ({
      id: c._id, name: c.name, phone: c.phone, requestedAt: c.pinResetRequestedAt,
    })),
  });
});

// Approving a reset clears the PIN, so the person can set a new one by signing up
// again with the same number. It never sets a PIN on their behalf.
authRouter.post('/pin-resets/:role/:id/approve', async (req, res) => {
  const Model = req.params.role === 'captain' ? Captain : Customer;
  const doc = await Model.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.pinHash = undefined;
  doc.pinResetRequestedAt = undefined;
  doc.failedAttempts = 0;
  doc.lockedUntil = undefined;
  await doc.save();
  res.json({ cleared: true });
});

authRouter.post('/pin-resets/:role/:id/dismiss', async (req, res) => {
  const Model = req.params.role === 'captain' ? Captain : Customer;
  const doc = await Model.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.pinResetRequestedAt = undefined;
  await doc.save();
  res.json({ dismissed: true });
});

// Lets a signed-in person change their own PIN by proving the current one.
authRouter.post('/change-pin', async (req, res) => {
  const Model = req.body.role === 'captain' ? Captain : Customer;
  const { error, status, doc } = await signInWithPin(Model, req.body.phone, req.body.currentPin);
  if (error) return res.status(status).json({ error });

  const pinError = validatePin(req.body.newPin);
  if (pinError) return res.status(400).json({ error: pinError });

  doc.pinHash = await hashPin(req.body.newPin);
  await doc.save();
  res.json({ changed: true });
});

// --- phone.email verification ------------------------------------------------

// Step 1: the browser widget verifies the number and hands us its user_json_url.
// We read the number server-side and return a short-lived token, so the phone
// number used for signup or a reset is never one the client simply typed.
authRouter.post('/phone-email/verify', async (req, res) => {
  try {
    const { token, phoneNormalized, firstName, lastName } = await consumePhoneEmailUrl(
      req.body.user_json_url,
    );
    res.json({
      verificationToken: token,
      phone: phoneNormalized,
      name: [firstName, lastName].filter(Boolean).join(' '),
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not confirm your phone number.' });
  }
});

// Step 2 (captains): set a new PIN after verifying the number.
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
  captain.pinResetRequestedAt = undefined;
  await captain.save();
  res.json({ captain });
});
