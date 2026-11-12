"use client";

import { useEffect, useState } from "react";

/**
 * Zustand v5 no longer exposes `store.persist.hasHydrated()` reliably.
 * Wait for client mount instead so cart/wishlist counts don't flash empty.
 */
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function useCartReady() {
  return useHydrated();
}

export function useWishlistReady() {
  return useHydrated();
}
