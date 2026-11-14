/**
 * Weighted interleave across N department pools.
 * @param {{ items?: unknown[], weight?: number }[]} pools
 * @param {number} limit
 */
export function mixProductsWeighted(pools = [], limit = 24) {
  const active = pools
    .map((pool) => ({
      items: Array.isArray(pool.items) ? pool.items : [],
      weight: Number(pool.weight) > 0 ? Number(pool.weight) : 0,
    }))
    .filter((pool) => pool.items.length && pool.weight > 0);

  if (!active.length) return [];

  const weightSum = active.reduce((sum, pool) => sum + pool.weight, 0);
  const targets = active.map((pool) => Math.max(1, Math.round((limit * pool.weight) / weightSum)));
  // Adjust rounding so targets sum to limit when possible.
  let allocated = targets.reduce((sum, n) => sum + n, 0);
  while (allocated > limit) {
    const idx = targets.findIndex((n) => n > 1);
    if (idx < 0) break;
    targets[idx] -= 1;
    allocated -= 1;
  }
  while (allocated < limit) {
    const idx = targets.reduce((best, n, i) => (n < targets[best] ? i : best), 0);
    targets[idx] += 1;
    allocated += 1;
  }

  const queues = active.map((pool, i) => pool.items.slice(0, targets[i]));
  const out = [];
  const cursors = queues.map(() => 0);

  // Round-robin biased by remaining quota (pick pool with most remaining).
  while (out.length < limit) {
    let best = -1;
    let bestLeft = 0;
    for (let i = 0; i < queues.length; i += 1) {
      const left = queues[i].length - cursors[i];
      if (left > bestLeft) {
        bestLeft = left;
        best = i;
      }
    }
    if (best < 0 || bestLeft <= 0) break;
    out.push(queues[best][cursors[best]]);
    cursors[best] += 1;
  }

  return out;
}

/** Back-compat: toys ~70% / décor ~30%. */
export function mixProducts(toys = [], decor = [], limit = 24, toysShare = 0.7) {
  return mixProductsWeighted(
    [
      { items: toys, weight: toysShare },
      { items: decor, weight: Math.max(0.05, 1 - toysShare) },
    ],
    limit
  );
}
