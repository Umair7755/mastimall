"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Horizontal scroller with swipe, arrows (desktop), and auto-slide on mobile. */
export function Carousel({ children, className, itemClassName, autoPlay = true }) {
  const scroller = useRef(null);
  const pauseUntil = useRef(0);

  function scrollBy(dir) {
    const node = scroller.current;
    if (!node) return;
    const amount = Math.max(240, Math.round(node.clientWidth * 0.72));
    const max = node.scrollWidth - node.clientWidth;
    let next = node.scrollLeft + dir * amount;
    if (dir > 0 && node.scrollLeft >= max - 8) next = 0;
    if (dir < 0 && node.scrollLeft <= 8) next = max;
    node.scrollTo({ left: next, behavior: "smooth" });
  }

  useEffect(() => {
    if (!autoPlay) return undefined;
    const node = scroller.current;
    if (!node) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (reduceMotion || desktop) return undefined;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() < pauseUntil.current) return;
      if (node.scrollWidth <= node.clientWidth + 8) return;
      scrollBy(1);
    }, 3800);

    function pause() {
      pauseUntil.current = Date.now() + 8000;
    }

    node.addEventListener("pointerdown", pause, { passive: true });
    node.addEventListener("touchstart", pause, { passive: true });
    node.addEventListener("wheel", pause, { passive: true });

    return () => {
      window.clearInterval(timer);
      node.removeEventListener("pointerdown", pause);
      node.removeEventListener("touchstart", pause);
      node.removeEventListener("wheel", pause);
    };
  }, [autoPlay, children]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scroller}
        className="no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain pb-1 sm:gap-4"
        style={{ overflowAnchor: "none", scrollSnapType: "none" }}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div key={child.key || index} className={cn("shrink-0", itemClassName)}>
                {child}
              </div>
            ))
          : children}
      </div>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => {
          pauseUntil.current = Date.now() + 8000;
          scrollBy(-1);
        }}
        className="absolute -left-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line/70 bg-white text-ink shadow-soft transition hover:bg-brand hover:text-white lg:grid"
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => {
          pauseUntil.current = Date.now() + 8000;
          scrollBy(1);
        }}
        className="absolute -right-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line/70 bg-white text-ink shadow-soft transition hover:bg-brand hover:text-white lg:grid"
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
