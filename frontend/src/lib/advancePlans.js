/** Mirror of backend advance tiers for labels / offline fallback. */
export const ADVANCE_PLANS = [
  {
    id: "none",
    label: "Pay on delivery",
    short: "COD",
    discountPercent: 0,
    advancePercent: 0,
    blurb: "Pay the rider. No advance, no extra discount.",
  },
  {
    id: "25",
    label: "Pay 25% now",
    short: "25%",
    discountPercent: 5,
    advancePercent: 25,
    blurb: "Small advance helps cover delivery — you save 5%.",
  },
  {
    id: "50",
    label: "Pay half now",
    short: "50%",
    discountPercent: 10,
    advancePercent: 50,
    blurb: "Split the bill — save 10% on toys & décor.",
  },
  {
    id: "100",
    label: "Pay full now",
    short: "100%",
    discountPercent: 15,
    advancePercent: 100,
    blurb: "Best saving — 15% off products.",
  },
];

export function advancePlanMeta(id) {
  return ADVANCE_PLANS.find((item) => item.id === id) || ADVANCE_PLANS[0];
}
