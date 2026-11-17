"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/browser";
import { readDraft } from "@/lib/draft";

/** Ask the API for the real prices, stock, delivery fee, and advance plans. */
export function useQuote(items, city, advancePlan = "none") {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolvedCity, setResolvedCity] = useState(city || "");

  useEffect(() => {
    if (city) {
      setResolvedCity(city);
      return;
    }
    setResolvedCity(readDraft().city || "Other");
  }, [city]);

  const key = JSON.stringify(items.map((item) => [item.productId, item.qty]));
  const plan = advancePlan || "none";

  useEffect(() => {
    if (!items.length || !resolvedCity) {
      setQuote(null);
      setLoading(false);
      return undefined;
    }
    let cancel = false;
    setLoading(true);
    apiFetch("/quote", {
      method: "POST",
      body: JSON.stringify({
        city: resolvedCity,
        advancePlan: plan,
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
      }),
    })
      .then((data) => {
        if (!cancel) {
          setQuote(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancel) setError(err.message);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
    // `key` already tracks product ids and quantities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, resolvedCity, plan]);

  return { quote, loading, error };
}
