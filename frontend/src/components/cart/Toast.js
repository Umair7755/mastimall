"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

export function Toast() {
  const notice = useCart((state) => state.notice);
  const clearNotice = useCart((state) => state.clearNotice);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(clearNotice, 2200);
    return () => clearTimeout(timer);
  }, [notice, clearNotice]);

  if (!notice) return null;
  return (
    <div
      role="status"
      className="mobile-chrome-bottom fixed left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-white shadow-lift"
    >
      {notice}
    </div>
  );
}
