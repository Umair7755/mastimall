"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/browser";
import { readDraft } from "@/lib/draft";
import { useCart } from "@/store/cart";

/**
 * Storefront-only: unique daily visit beacon + debounced cart sync for abandoned carts.
 */
export function StoreAnalytics() {
  const pathname = usePathname();
  const items = useCart((state) => state.items);
  const visitSent = useRef(false);
  const timer = useRef(null);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    if (useCart.persist.hasHydrated()) {
      setCartReady(true);
      return undefined;
    }
    return useCart.persist.onFinishHydration(() => setCartReady(true));
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return undefined;
    if (visitSent.current) return undefined;
    visitSent.current = true;

    apiFetch("/analytics/visit", {
      method: "POST",
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      /* non-blocking */
    });

    return undefined;
  }, [pathname]);

  useEffect(() => {
    if (!cartReady || !pathname || pathname.startsWith("/admin")) return undefined;

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const draft = readDraft() || {};
      apiFetch("/cart/sync", {
        method: "POST",
        body: JSON.stringify({
          items: (items || []).map((item) => ({
            productId: item.productId,
            title: item.title,
            slug: item.slug,
            href: item.href,
            image: item.image,
            qty: item.qty,
          })),
          contact: {
            name: draft.name || "",
            phone: draft.phone || "",
            email: "",
          },
        }),
      }).catch(() => {
        /* non-blocking */
      });
    }, 1000);

    return () => window.clearTimeout(timer.current);
  }, [cartReady, items, pathname]);

  return null;
}
