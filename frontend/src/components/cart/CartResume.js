"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/browser";
import { useCart } from "@/store/cart";

/**
 * Restores a saved cart from /cart?resume=TOKEN (WhatsApp follow-up links).
 * Runs once per token; replaces local cart with the server snapshot.
 */
export function CartResume() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const replaceItems = useCart((state) => state.replaceItems);
  const notify = useCart((state) => state.notify);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const ran = useRef("");

  useEffect(() => {
    const token = String(searchParams.get("resume") || "").trim();
    if (!token || ran.current === token) return undefined;
    ran.current = token;

    let cancelled = false;

    (async () => {
      try {
        const data = await apiFetch(`/cart/resume/${encodeURIComponent(token)}`);
        if (cancelled) return;
        replaceItems(data.items || []);
        notify("Aapki cart restore ho gayi — checkout ready.");
        setMessage("Your saved cart is ready. Review items below, then checkout.");
        setError("");
        router.replace("/cart", { scroll: false });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "This cart link is no longer valid.");
        setMessage("");
        router.replace("/cart", { scroll: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, replaceItems, notify, router]);

  if (!message && !error) return null;

  return (
    <div
      className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
        error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
      }`}
      role="status"
    >
      {error || message}
    </div>
  );
}
