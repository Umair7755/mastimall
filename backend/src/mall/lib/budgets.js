/**
 * Canonical store budget bands — keep in sync with frontend/src/lib/constants.js BUDGETS.
 * - under-1000 → 0–1000
 * - under-3000 → 0–3000
 * - 5000-plus  → 5000 and above (no max)
 */
export const BUDGETS = [
  { slug: "under-1000", min: 0, max: 1000 },
  { slug: "under-3000", min: 0, max: 3000 },
  { slug: "5000-plus", min: 5000, max: null, orMore: true },
];

const BUDGET_ALIASES = {
  "under-500": "under-1000",
  "under-2000": "under-3000",
  "under-5000": "5000-plus",
  "from-5000": "5000-plus",
};

export function budgetBySlug(slug) {
  if (!slug) return null;
  const key = BUDGET_ALIASES[String(slug)] || String(slug);
  return BUDGETS.find((item) => item.slug === key) || null;
}

/** Resolve min/max from ?budget=slug and/or explicit ?minPrice=&maxPrice=. */
export function resolvePriceFilter(query = {}) {
  let minPrice = Number(query.minPrice);
  let maxPrice = Number(query.maxPrice);
  if (!Number.isFinite(minPrice) || minPrice < 0) minPrice = NaN;
  if (!Number.isFinite(maxPrice) || maxPrice < 0) maxPrice = NaN;

  const band = budgetBySlug(query.budget);
  if (band) {
    if (!(Number.isFinite(minPrice) && minPrice > 0) && Number(band.min) > 0) {
      minPrice = Number(band.min);
    }
    if (!(Number.isFinite(maxPrice) && maxPrice > 0) && band.max != null && Number(band.max) > 0) {
      maxPrice = Number(band.max);
    }
  }

  return {
    minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : null,
  };
}
