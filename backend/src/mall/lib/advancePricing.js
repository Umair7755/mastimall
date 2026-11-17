/**
 * Advance Pay & Save — single source of truth for checkout + admin.
 *
 * Rules (confirmed):
 * - Discount applies to product subtotal only (not shipping)
 * - Advance % is of payable after discount + shipping
 * - Free shipping still uses pre-discount subtotal
 * - 25% tier always shown (even if advance < Rs 350)
 *
 * Tiers:
 * - none → 0% discount, full COD
 * - 25% advance → 5% off
 * - 50% advance → 10% off
 * - 100% advance → 15% off
 */

export const ADVANCE_PLANS = {
  none: {
    id: "none",
    advancePercent: 0,
    discountPercent: 0,
    label: "Pay on delivery",
    short: "COD",
    blurb: "Pay the rider. No advance, no extra discount.",
  },
  "25": {
    id: "25",
    advancePercent: 25,
    discountPercent: 5,
    label: "Pay 25% now",
    short: "25%",
    blurb: "Small advance helps cover delivery — you save 5%.",
  },
  "50": {
    id: "50",
    advancePercent: 50,
    discountPercent: 10,
    label: "Pay half now",
    short: "50%",
    blurb: "Split the bill — save 10% on toys & décor.",
  },
  "100": {
    id: "100",
    advancePercent: 100,
    discountPercent: 15,
    label: "Pay full now",
    short: "100%",
    blurb: "Best saving — 15% off products.",
  },
};

export const ADVANCE_PLAN_IDS = Object.keys(ADVANCE_PLANS);

export function normalizeAdvancePlan(value) {
  const key = value == null || value === "" ? "none" : String(value);
  return ADVANCE_PLANS[key] ? key : "none";
}

export function getAdvancePlan(value) {
  return ADVANCE_PLANS[normalizeAdvancePlan(value)];
}

/** Round to whole rupees. */
function pkr(n) {
  return Math.max(0, Math.round(Number(n) || 0));
}

/**
 * @param {{ subtotal: number, shippingFee: number, advancePlan?: string }} input
 */
export function computeAdvancePricing({ subtotal, shippingFee, advancePlan = "none" }) {
  const plan = getAdvancePlan(advancePlan);
  const safeSubtotal = pkr(subtotal);
  const safeShipping = pkr(shippingFee);
  const discountAmount = pkr((safeSubtotal * plan.discountPercent) / 100);
  const afterDiscount = Math.max(0, safeSubtotal - discountAmount);
  const total = afterDiscount + safeShipping;
  const advanceAmount = pkr((total * plan.advancePercent) / 100);
  const balanceAmount = Math.max(0, total - advanceAmount);

  return {
    planId: plan.id,
    advancePercent: plan.advancePercent,
    discountPercent: plan.discountPercent,
    label: plan.label,
    short: plan.short,
    blurb: plan.blurb,
    subtotal: safeSubtotal,
    shippingFee: safeShipping,
    discountAmount,
    afterDiscount,
    total,
    advanceAmount,
    balanceAmount,
    requiresReceipt: plan.advancePercent > 0,
  };
}

/** Build all plan quotes for checkout cards. */
export function listAdvanceQuotes({ subtotal, shippingFee }) {
  return ADVANCE_PLAN_IDS.map((id) =>
    computeAdvancePricing({ subtotal, shippingFee, advancePlan: id })
  );
}
