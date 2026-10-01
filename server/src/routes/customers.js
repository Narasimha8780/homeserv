import { Router } from 'express';
import { Customer } from '../models/Customer.js';
import { normalizePhone } from '../utils/phone.js';
import { consumeOtp } from '../utils/otpVerify.js';

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

// Plain create — used when a Sign In attempt finds no account (phone was already
// OTP-verified moments earlier) and the customer just needs to supply their name
// to finish signing up, same pattern as captain registration after OTP login.
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

// Sign up (name + phone + OTP code together) or sign in (phone + OTP code only).
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
