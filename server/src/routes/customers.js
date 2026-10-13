import { Router } from 'express';
import { Customer } from '../models/Customer.js';
import { normalizePhone } from '../utils/phone.js';
import { consumeOtp } from '../utils/otpVerify.js';
import { validatePin, hashPin } from '../utils/pin.js';
import { signInWithPin } from '../utils/pinAuth.js';
import { redeemVerificationToken } from '../utils/phoneEmail.js';

export const customersRouter = Router();

async function findOrCreateCustomer(name, phone) {
  const phoneNormalized = normalizePhone(phone);
  let customer = await Customer.findOne({ phoneNormalized });
  if (!customer) {
    customer = await Customer.create({
      _id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      phoneNormalized,
    });
  }
  return customer;
}

// Sign up: name + phone + 4-digit PIN. The PIN is what the customer signs back
// in with later, so no SMS or WhatsApp delivery is involved anywhere.
customersRouter.post('/signup', async (req, res) => {
  const { name, phone, pin, verificationToken } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Please enter your name' });

  // When the number was verified by phone.email, that number wins — never the one
  // in the request body, which the client controls.
  let phoneNormalized;
  if (verificationToken) {
    phoneNormalized = await redeemVerificationToken(verificationToken);
    if (!phoneNormalized) {
      return res.status(400).json({ error: 'Verification expired. Please verify your number again.' });
    }
  } else {
    phoneNormalized = normalizePhone(phone);
  }
  if (phoneNormalized.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }

  const pinError = validatePin(pin);
  if (pinError) return res.status(400).json({ error: pinError });

  const existing = await Customer.findOne({ phoneNormalized });
  if (existing?.pinHash) {
    return res.status(409).json({ error: 'This number is already registered. Please sign in.' });
  }

  // An account may already exist without a PIN (created before PIN login, or by an
  // earlier OTP sign-up) — in that case just attach the PIN to it.
  const customer = existing || (await findOrCreateCustomer(name, phoneNormalized));
  customer.name = name.trim();
  customer.pinHash = await hashPin(pin);
  customer.failedAttempts = 0;
  customer.lockedUntil = undefined;
  await customer.save();

  res.status(201).json({ customer });
});

// Sign in: phone + PIN.
customersRouter.post('/signin', async (req, res) => {
  const { error, status, doc } = await signInWithPin(
    Customer,
    req.body.phone,
    req.body.pin,
  );
  if (error) return res.status(status).json({ error });
  res.json({ customer: doc });
});

// Forgot PIN: flags the account so an admin can confirm the person by calling the
// number, then clear the PIN so they can set a new one.
customersRouter.post('/forgot-pin', async (req, res) => {
  const phoneNormalized = normalizePhone(req.body.phone);
  if (phoneNormalized.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }
  const customer = await Customer.findOne({ phoneNormalized });
  if (customer) {
    customer.pinResetRequestedAt = new Date();
    await customer.save();
  }
  // Always the same reply, so this can't be used to discover registered numbers.
  res.json({ requested: true });
});

// Sets a new PIN once phone.email has confirmed the number — the self-service
// replacement for an admin clearing the PIN by hand.
customersRouter.post('/reset-pin', async (req, res) => {
  const phoneNormalized = await redeemVerificationToken(req.body.verificationToken);
  if (!phoneNormalized) {
    return res.status(400).json({ error: 'Verification expired. Please verify your number again.' });
  }

  const pinError = validatePin(req.body.pin);
  if (pinError) return res.status(400).json({ error: pinError });

  const customer = await Customer.findOne({ phoneNormalized });
  if (!customer) return res.status(404).json({ error: 'No account found for this number.' });

  customer.pinHash = await hashPin(req.body.pin);
  customer.failedAttempts = 0;
  customer.lockedUntil = undefined;
  customer.pinResetRequestedAt = undefined;
  await customer.save();
  res.json({ customer });
});

// Plain create — kept for the OTP sign-up path.
customersRouter.post('/', async (req, res) => {
  const { name, phone } = req.body;
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'name and phone are required' });
  }
  if (normalizePhone(phone).length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }
  const customer = await findOrCreateCustomer(name, phone);
  res.status(201).json(customer);
});

// OTP sign-up / sign-in. Unused while PIN login is on, kept so OTP can be switched
// back on as the self-service PIN reset path once a provider is available.
customersRouter.post('/verify-otp', async (req, res) => {
  const { name, phone } = req.body;
  const { ok } = await consumeOtp(phone, req.body.code);
  if (!ok) return res.status(400).json({ error: 'Invalid or expired OTP' });

  const phoneNormalized = normalizePhone(phone);
  let customer = await Customer.findOne({ phoneNormalized });
  if (!customer && name?.trim()) {
    customer = await findOrCreateCustomer(name, phone);
  }
  res.json({ verified: true, customer: customer || null });
});
