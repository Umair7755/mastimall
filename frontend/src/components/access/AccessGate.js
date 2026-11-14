"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Ban } from "lucide-react";
import { apiFetch, isBlacklistedError } from "@/lib/browser";

const EVENT = "mastimall:blacklisted";

export function signalBlacklisted(reason) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { reason: reason || "" } }));
}

/**
 * Storefront lockout when the shopper is on the blocklist.
 * Covers initial check + any later API 403 BLACKLISTED responses.
 */
export function AccessGate() {
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return undefined;

    let cancelled = false;
    apiFetch("/access/status")
      .then((data) => {
        if (cancelled) return;
        if (data?.blocked) {
          setBlocked(true);
          setReason(data.reason || "");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (isBlacklistedError(err)) {
          setBlocked(true);
          setReason(err.message || "");
        }
      });

    function onBlocked(event) {
      setBlocked(true);
      setReason(event?.detail?.reason || "");
    }
    window.addEventListener(EVENT, onBlocked);
    return () => {
      cancelled = true;
      window.removeEventListener(EVENT, onBlocked);
    };
  }, [pathname]);

  useEffect(() => {
    if (!blocked || pathname?.startsWith("/admin")) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [blocked, pathname]);

  if (!blocked || pathname?.startsWith("/admin")) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="blacklist-title"
      aria-describedby="blacklist-body"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Ban size={22} strokeWidth={2.25} aria-hidden="true" />
        </div>
        <h2 id="blacklist-title" className="mt-4 text-center text-xl font-semibold text-slate-900">
          You are blacklisted
        </h2>
        <p id="blacklist-body" className="mt-2 text-center text-sm leading-relaxed text-slate-600">
          {reason ||
            "You cannot browse, add to cart, or place orders on Masti Mall. If you think this is a mistake, contact support."}
        </p>
        <p className="mt-4 text-center text-xs text-slate-400">This store is unavailable for your account or device.</p>
      </div>
    </div>
  );
}
