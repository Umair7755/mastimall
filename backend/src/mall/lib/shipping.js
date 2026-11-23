import { MallSetting } from '../models/Setting.js';

export const DEFAULT_SHIPPING = {
  freeAt: 3000,
  nearFee: 200,
  farFee: 250,
  nearCities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
};

const CACHE_TTL_MS = 30_000;
let cache = { at: 0, value: null };

function normalizeShipping(raw = {}) {
  const freeAt = Math.max(0, Math.round(Number(raw.freeAt ?? DEFAULT_SHIPPING.freeAt)));
  const nearFee = Math.max(0, Math.round(Number(raw.nearFee ?? DEFAULT_SHIPPING.nearFee)));
  const farFee = Math.max(0, Math.round(Number(raw.farFee ?? DEFAULT_SHIPPING.farFee)));
  const cities = Array.isArray(raw.nearCities) ? raw.nearCities : DEFAULT_SHIPPING.nearCities;
  const nearCities = [
    ...new Set(
      cities
        .map((city) => String(city || '').trim())
        .filter(Boolean)
        .map((city) => city.replace(/\s+/g, ' '))
    ),
  ];
  return {
    freeAt,
    nearFee,
    farFee,
    nearCities: nearCities.length ? nearCities : [...DEFAULT_SHIPPING.nearCities],
  };
}

export function invalidateShippingCache() {
  cache = { at: 0, value: null };
}

export async function loadShippingSettings() {
  const now = Date.now();
  if (cache.value && now - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }
  const doc = await MallSetting.findOne({ key: 'shipping' }).lean();
  const value = normalizeShipping(doc?.value || {});
  cache = { at: now, value };
  return value;
}

export async function saveShippingSettings(input) {
  const next = normalizeShipping(input);
  await MallSetting.findOneAndUpdate({ key: 'shipping' }, { value: next }, { upsert: true });
  invalidateShippingCache();
  cache = { at: Date.now(), value: next };
  return next;
}

/** Shipping is recomputed on the server. Never trust a fee from the browser. */
export async function shippingFee(subtotal, city) {
  const settings = await loadShippingSettings();
  if (Number(subtotal) >= settings.freeAt) return 0;
  const key = String(city || '').trim().toLowerCase();
  const near = new Set(settings.nearCities.map((c) => c.toLowerCase()));
  return near.has(key) ? settings.nearFee : settings.farFee;
}

/** @deprecated Prefer loadShippingSettings().freeAt — kept for older imports. */
export const FREE_SHIPPING_AT = DEFAULT_SHIPPING.freeAt;
