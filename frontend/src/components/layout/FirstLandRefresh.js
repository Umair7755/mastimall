"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** One hard boot per browser tab session — must survive the reload. */
const SESSION_KEY = "masti-first-land-v1";

/**
 * On first storefront land in a tab session, hard-reload once so the user
 * never keeps a stale HTML/RSC shell (common on mobile + bfcache).
 *
 * Safety:
 * - Flag is written BEFORE reload → cannot loop
 * - Admin routes skipped
 * - Back-forward cache restores also force a fresh document
 */
export function FirstLandRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (pathname?.startsWith("/admin")) return undefined;

    function onPageShow(event) {
      // Safari/iOS often restores a frozen page — force a real reload.
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener("pageshow", onPageShow);

    let alreadyDone = false;
    try {
      alreadyDone = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Private mode / blocked storage → skip hard refresh rather than risk a loop.
      return () => window.removeEventListener("pageshow", onPageShow);
    }

    if (alreadyDone) {
      return () => window.removeEventListener("pageshow", onPageShow);
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      return () => window.removeEventListener("pageshow", onPageShow);
    }

    // Next tick: ensures the session flag is committed before navigation.
    const timer = window.setTimeout(() => {
      window.location.reload();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname]);

  return null;
}
