"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const POLL_MS = 45000;
export const ORDERS_UPDATED_EVENT = "mastimall:orders-updated";

/**
 * Free alternative to websockets: poll tiny revision counters.
 * Catalog changes → router.refresh(). Order status changes → refresh + notify account UI.
 */
export function LiveStoreRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const catalogRef = useRef(null);
  const ordersRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return undefined;

    let cancelled = false;

    async function check() {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`/api/settings/revision?_=${Date.now()}`, {
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (!response.ok || cancelled) return;
        const data = await response.json();
        const catalog = Number(data.catalogRevision ?? data.revision) || 0;
        const orders = Number(data.ordersRevision) || 0;

        if (catalogRef.current == null) {
          catalogRef.current = catalog;
          ordersRef.current = orders;
          return;
        }

        let shouldRefresh = false;
        if (catalog !== catalogRef.current) {
          catalogRef.current = catalog;
          shouldRefresh = true;
        }
        if (orders !== ordersRef.current) {
          ordersRef.current = orders;
          shouldRefresh = true;
          window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
        }
        if (shouldRefresh) router.refresh();
      } catch {
        // Ignore transient network / cold-start errors.
      }
    }

    check();
    timerRef.current = window.setInterval(check, POLL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") check();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname, router]);

  return null;
}
