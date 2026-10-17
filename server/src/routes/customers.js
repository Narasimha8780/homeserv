import { Router } from 'express';
import { Customer } from '../models/Customer.js';
import { validatePin, hashPin } from '../utils/pin.js';
import { signInWithPin } from '../utils/pinAuth.js';
import { redeemVerificationToken } from '../utils/verificationToken.js';

export const customersRouter = Router();

const VERIFY_AGAIN = 'Verification expired. Please verify your number again.';

// Sign up: a verified number (via the OTP token), a name, and a 4-digit PIN. The
// token is required — the phone number always comes from it, never from the
// request body, so an account can only be created for a number that was proven.
customersRouter.post('/signup', async (req, res) => {
  const { name, pin, verificationToken } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Please enter your name' });

  const pinError = validatePin(pin);
  if (pinError) return res.status(400).json({ error: pinError });

  const phoneNormalized = await redeemVerificationToken(verificationToken);
  if (!phoneNormalized) return res.status(400).json({ error: VERIFY_AGAIN });

  const existing = await Customer.findOne({ phoneNormalized });
  if (existing?.pinHash) {
    return res.status(409).json({ error: 'This number is already registered. Please sign in.' });
  }

  // An account may already exist without a PIN (created before PIN login) — in
  // that case just attach the PIN to it.
  const customer =
    existing ||
    new Customer({ _id: `cust-${Date.now()}`, phone: `+91 ${phoneNormalized}`, phoneNormalized });
  customer.name = name.trim();
  customer.pinHash = await hashPin(pin);
  customer.failedAttempts = 0;
  customer.lockedUntil = undefined;
  await customer.save();

  res.status(201).json({ customer });
});

// Sign in: phone + PIN.
customersRouter.post('/signin', async (req, res) => {
  const { error, status, doc } = await signInWithPin(Customer, req.body.phone, req.body.pin);
  if (error) return res.status(status).json({ error });
  res.json({ customer: doc });
});

// Forgot PIN: set a new one once the number has been verified by OTP.
customersRouter.post('/reset-pin', async (req, res) => {
  const pinError = validatePin(req.body.pin);
  if (pinError) return res.status(400).json({ error: pinError });

  const phoneNormalized = await redeemVerificationToken(req.body.verificationToken);
  if (!phoneNormalized) return res.status(400).json({ error: VERIFY_AGAIN });

  const customer = await Customer.findOne({ phoneNormalized });
  if (!customer) return res.status(404).json({ error: 'No account found for this number.' });

  customer.pinHash = await hashPin(req.body.pin);
  customer.failedAttempts = 0;
  customer.lockedUntil = undefined;
  await customer.save();
  res.json({ customer });
});
