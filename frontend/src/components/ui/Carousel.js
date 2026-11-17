"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Horizontal scroller — calm autoplay, one-card steps. Mall picks marquee is separate. */
export function Carousel({
  children,
  className,
  itemClassName,
  gapClassName,
  autoPlay = true,
  intervalMs = 6200,
}) {
  const scroller = useRef(null);
  const pauseUntil = useRef(0);

  function stepSize(node) {
    const item = node.querySelector("[data-carousel-item]");
    if (item) {
      const styles = window.getComputedStyle(node);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return Math.round(item.getBoundingClientRect().width + gap);
    }
    return Math.max(180, Math.round(node.clientWidth * 0.55));
  }

  function scrollBy(dir) {
    const node = scroller.current;
    if (!node) return;
    const amount = stepSize(node);
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
    }, intervalMs);

    function pause() {
      pauseUntil.current = Date.now() + 14000;
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
  }, [autoPlay, children, intervalMs]);

  // Desktop arrows only — mobile is swipe-first and edge-to-edge.
  const arrowClass =
    "absolute top-[38%] z-20 hidden -translate-y-1/2 place-items-center rounded-full sm:grid " +
    "border-2 border-white bg-ink text-sun " +
    "shadow-[0_6px_16px_-6px_rgb(15_23_42_/_0.5)] ring-1 ring-ink/10 " +
    "transition active:scale-95 hover:bg-brand hover:text-white " +
    "h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11";

  return (
    <div className={cn("relative px-0 sm:px-5", className)}>
      <div
        ref={scroller}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth pb-1",
          "px-3 sm:px-0",
          gapClassName || "gap-3 sm:gap-4"
        )}
        style={{ overflowAnchor: "none", WebkitOverflowScrolling: "touch" }}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div
                key={child.key || index}
                data-carousel-item
                className={cn("shrink-0 snap-start", itemClassName)}
              >
                {child}
              </div>
            ))
          : children}
      </div>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => {
          pauseUntil.current = Date.now() + 10000;
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
          pauseUntil.current = Date.now() + 10000;
          scrollBy(1);
        }}
        className={cn(arrowClass, "right-0")}
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.75} />
      </button>
    </div>
  );
}
