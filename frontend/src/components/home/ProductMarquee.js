"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ToyImage } from "@/components/product/ToyImage";
import { useAddToCart } from "@/hooks/useAddToCart";
import { usePageVisible } from "@/hooks/usePageVisible";
import { formatPkr } from "@/lib/format";
import { productPath } from "@/lib/paths";
import { cn } from "@/lib/cn";

function MarqueeProductCard({ product }) {
  const addToCart = useAddToCart();
  const href = productPath(product);
  const image = product.images?.[0];
  const price = product.currentPrice ?? product.salePrice ?? product.price;
  const onSale = product.salePrice > 0 && product.salePrice < product.price;

  return (
    <article className="group flex w-[9.75rem] shrink-0 flex-col overflow-hidden rounded-[1.35rem] border border-white/70 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift sm:w-[12rem] lg:w-[13rem]">
      <Link href={href} prefetch={false} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#fff7ec] via-[#f3f0ff] to-[#ffe8f1]">
          <ToyImage
            src={image?.url}
            alt={image?.alt || product.title}
            sizes="(max-width: 640px) 156px, 220px"
            className="object-contain p-3 transition duration-300 group-hover:scale-105 sm:p-4"
          />
          {onSale || product.isNew ? (
            <span
              className={cn(
                "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
                onSale ? "bg-coral" : "bg-brand"
              )}
            >
              {onSale ? "Sale" : "New"}
            </span>
          ) : null}
        </div>
        <div className="px-2.5 pb-1 pt-2.5">
          <h3 className="line-clamp-2 min-h-[2.4em] font-display text-sm font-semibold leading-snug text-ink sm:text-[15px]">
            {product.title}
          </h3>
          <p className="mt-1 font-display text-base font-semibold tabular-nums text-brand">
            {formatPkr(price)}
            {onSale ? (
              <span className="ml-1.5 text-xs font-medium text-ink-muted line-through">
                {formatPkr(product.price)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
      {product.inStock ? (
        <Button
          variant="sun"
          className="mx-2.5 mb-2.5 mt-auto !min-h-10 w-[calc(100%-1.25rem)] !rounded-full !bg-[#fbbf24] !px-3 !text-xs !text-ink hover:!brightness-105"
          onClick={() => addToCart(product, 1)}
        >
          <ShoppingBag size={13} aria-hidden="true" />
          Add
        </Button>
      ) : (
        <p className="mx-2.5 mb-2.5 mt-auto text-center text-[11px] font-semibold text-coral">Sold out</p>
      )}
    </article>
  );
}

/**
 * Mall picks rail.
 * Mobile: swipe + arrows only (no continuous timer — major heat fix).
 * Desktop: gentle auto-nudge every few seconds, paused off-screen / hidden tab.
 */
export function ProductMarquee({ products = [] }) {
  const reduceMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const scroller = useRef(null);
  const rootRef = useRef(null);
  const pauseUntil = useRef(0);
  const [inView, setInView] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
    // No continuous scroll on mobile — biggest JS heat win.
    if (reduceMotion || !isDesktop || !pageVisible || !inView) return undefined;
    const node = scroller.current;
    if (!node) return undefined;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() < pauseUntil.current) return;
      if (node.scrollWidth <= node.clientWidth + 8) return;
      const max = node.scrollWidth - node.clientWidth;
      const next = node.scrollLeft + Math.round(node.clientWidth * 0.55);
      node.scrollTo({
        left: next >= max - 8 ? 0 : next,
        behavior: "smooth",
      });
    }, 3800);

    function pause() {
      pauseUntil.current = Date.now() + 12000;
    }

    node.addEventListener("pointerdown", pause, { passive: true });
    node.addEventListener("wheel", pause, { passive: true });

    return () => {
      window.clearInterval(timer);
      node.removeEventListener("pointerdown", pause);
      node.removeEventListener("wheel", pause);
    };
  }, [reduceMotion, isDesktop, pageVisible, inView, products]);

  if (!products.length) return null;

  const list = isDesktop ? products : products.slice(0, 12);

  const arrowClass =
    "absolute top-[38%] z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full " +
    "border-2 border-white bg-ink text-sun shadow-[0_6px_16px_-6px_rgb(15_23_42_/_0.5)] " +
    "ring-1 ring-ink/10 transition active:scale-95 sm:h-10 sm:w-10 lg:h-11 lg:w-11";

  return (
    <div ref={rootRef} className="relative -mx-3 py-1 sm:mx-0">
      <div
        ref={scroller}
        className="no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain px-3 pb-1 sm:gap-4 sm:px-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {list.map((product) => (
          <MarqueeProductCard key={product.id} product={product} />
        ))}
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
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.75} aria-hidden="true" />
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
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.75} aria-hidden="true" />
      </button>
      <span className="sr-only">Swipe to browse mall picks.</span>
    </div>
  );
}
