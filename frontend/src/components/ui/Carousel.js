"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Horizontal scroller with bold arrows on every screen size (swipe still works). */
export function Carousel({ children, className, itemClassName, gapClassName, autoPlay = true }) {
  const scroller = useRef(null);
  const pauseUntil = useRef(0);

  function scrollBy(dir) {
    const node = scroller.current;
    if (!node) return;
    const amount = Math.max(200, Math.round(node.clientWidth * 0.7));
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
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() < pauseUntil.current) return;
      if (node.scrollWidth <= node.clientWidth + 8) return;
      scrollBy(1);
    }, 4200);

    function pause() {
      pauseUntil.current = Date.now() + 12000;
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

  const arrowClass =
    "absolute top-[42%] z-20 grid -translate-y-1/2 place-items-center rounded-full " +
    "border-2 border-white bg-ink text-sun " +
    "shadow-[0_6px_16px_-6px_rgb(15_23_42_/_0.5)] ring-1 ring-ink/10 " +
    "transition active:scale-95 hover:bg-brand hover:text-white " +
    "h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11";

  return (
    <div className={cn("relative px-0", className)}>
      <div
        ref={scroller}
        className={cn(
          "no-scrollbar flex overflow-x-auto overscroll-x-contain pb-1",
          gapClassName || "gap-3 sm:gap-4"
        )}
        style={{ overflowAnchor: "none", scrollSnapType: "none", WebkitOverflowScrolling: "touch" }}
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
        className={cn(arrowClass, "left-0")}
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.75} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => {
          pauseUntil.current = Date.now() + 8000;
          scrollBy(1);
        }}
        className={cn(arrowClass, "right-0")}
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.75} />
      </button>
    </div>
  );
}
