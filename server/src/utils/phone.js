// Normalizes any phone format (+91 98290 12345, 919829012345, 9829012345, ...)
// down to its last 10 digits, so the same number always matches regardless of
// how it was typed or whether a country code was included.
export function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.slice(-10);
}
