"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Manual horizontal scroller (arrows + swipe). Top categories use CategoryMarquee instead. */
export function Carousel({ children, className, itemClassName }) {
  const scroller = useRef(null);

  function scrollBy(dir) {
    const node = scroller.current;
    if (!node) return;
    const amount = Math.max(240, Math.round(node.clientWidth * 0.72));
    node.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

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
        onClick={() => scrollBy(-1)}
        className="absolute -left-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line/70 bg-white text-ink shadow-soft transition hover:bg-brand hover:text-white lg:grid"
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollBy(1)}
        className="absolute -right-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line/70 bg-white text-ink shadow-soft transition hover:bg-brand hover:text-white lg:grid"
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
