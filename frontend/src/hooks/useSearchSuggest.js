"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/browser";

export function useSearchSuggest(query) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) {
      setItems([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      apiFetch(`/search/suggest?q=${encodeURIComponent(text)}`)
        .then((data) => setItems(data.items || []))
        .catch(() => setItems([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return items;
}
