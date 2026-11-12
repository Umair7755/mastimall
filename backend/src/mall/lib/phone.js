/** Normalize Pakistani mobile numbers to 03XXXXXXXXX. */
export function normalizePhone(input) {
  let digits = String(input || '').replace(/[^\d]/g, '');
  if (digits.startsWith('92') && digits.length === 12) digits = `0${digits.slice(2)}`;
  if (digits.startsWith('3') && digits.length === 10) digits = `0${digits}`;
  return digits;
}

export function isPkMobile(value) {
  return /^03\d{9}$/.test(normalizePhone(value));
}
