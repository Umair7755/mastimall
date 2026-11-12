import { FREE_SHIPPING_AT } from '../constants.js';

const NEAR_CITIES = new Set(['karachi', 'lahore', 'islamabad', 'rawalpindi']);

/** Shipping is recomputed on the server. Never trust a fee from the browser. */
export function shippingFee(subtotal, city) {
  if (subtotal >= FREE_SHIPPING_AT) return 0;
  const key = String(city || '').trim().toLowerCase();
  return NEAR_CITIES.has(key) ? 200 : 250;
}

export { FREE_SHIPPING_AT };
