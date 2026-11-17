/** Format a rupee amount the way the store speaks: "Rs 1,200". */
export function formatPkr(value) {
  const amount = Math.round(Number(value) || 0);
  return `Rs ${new Intl.NumberFormat("en-PK").format(amount)}`;
}

/** "Under 1,000" / "5,000 or more" for a budget tile. */
export function budgetLabel(limit, { orMore = false } = {}) {
  const amount = new Intl.NumberFormat("en-PK").format(limit);
  return orMore ? `${amount}+` : `Under ${amount}`;
}
