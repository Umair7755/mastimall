"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ToyImage } from "@/components/product/ToyImage";
import { useAddToCart } from "@/hooks/useAddToCart";
import { usePageVisible } from "@/hooks/usePageVisible";
import { formatPkr } from "@/lib/format";
import { productPath } from "@/lib/paths";
import { cn } from "@/lib/cn";

function DeskCard({ product }) {
  const addToCart = useAddToCart();
  const href = productPath(product);
  const image = product.images?.[0];
  const price = product.currentPrice ?? product.salePrice ?? product.price;
  const onSale = product.salePrice > 0 && product.salePrice < product.price;

  return (
    <article className="group flex w-[13rem] shrink-0 flex-col overflow-hidden rounded-[1.35rem] border border-white/70 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
      <Link href={href} prefetch={false} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#fff7ec] via-[#f3f0ff] to-[#ffe8f1]">
          <ToyImage
            src={image?.url}
            alt={image?.alt || product.title}
            sizes="220px"
            className="object-contain p-4 transition duration-300 group-hover:scale-105"
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
          <h3 className="line-clamp-2 min-h-[2.4em] font-display text-[15px] font-semibold leading-snug text-ink">
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

function SpotlightSlide({ product, priority }) {
  const href = productPath(product);
  const image = product.images?.[0];
  const price = product.currentPrice ?? product.salePrice ?? product.price;
  const onSale = product.salePrice > 0 && product.salePrice < product.price;

  return (
    <article className="w-full shrink-0 snap-center px-3">
      <Link
        href={href}
        prefetch={false}
        className="block overflow-hidden rounded-[1.35rem] bg-white shadow-[0_12px_28px_-16px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#fff7ec] via-[#f8fafc] to-[#fce7f3]">
          <ToyImage
            src={image?.url}
            alt={image?.alt || product.title}
            priority={priority}
            sizes="92vw"
            className="object-contain p-3"
          />
          {onSale || product.isNew ? (
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
                onSale ? "bg-coral" : "bg-brand"
              )}
            >
              {onSale ? "Sale" : "New"}
            </span>
          ) : null}
        </div>

        <div className="px-4 pb-4 pt-3">
          <h3 className="line-clamp-2 font-display text-[1.05rem] font-semibold leading-snug text-ink">
            {product.title}
          </h3>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-brand">
            {formatPkr(price)}
            {onSale ? (
              <span className="ml-2 text-sm font-medium text-ink-muted line-through">
                {formatPkr(product.price)}
              </span>
            ) : null}
          </p>
          {!product.inStock ? (
            <p className="mt-1 text-sm font-semibold text-coral">Sold out</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

function MobileSpotlight({ products }) {
  const reduceMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const scroller = useRef(null);
  const rootRef = useRef(null);
  const pauseUntil = useRef(0);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(true);
  const list = products.slice(0, 8);

  const syncActive = useCallback(() => {
    const node = scroller.current;
    if (!node || !node.clientWidth) return;
    const i = Math.round(node.scrollLeft / node.clientWidth);
    setActive(Math.max(0, Math.min(list.length - 1, i)));
  }, [list.length]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return undefined;
    node.addEventListener("scroll", syncActive, { passive: true });
    return () => node.removeEventListener("scroll", syncActive);
  }, [syncActive]);

  useEffect(() => {
    if (reduceMotion || !pageVisible || !inView || list.length < 2) return undefined;
    const node = scroller.current;
    if (!node) return undefined;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() < pauseUntil.current) return;
      const width = node.clientWidth;
      if (!width) return;
      const atEnd = node.scrollLeft >= (list.length - 1) * width - 8;
      node.scrollTo({
        left: atEnd ? 0 : node.scrollLeft + width,
        behavior: "smooth",
      });
    }, 4200);

    function pause() {
      pauseUntil.current = Date.now() + 10000;
    }

    node.addEventListener("pointerdown", pause, { passive: true });
    node.addEventListener("touchstart", pause, { passive: true });

    return () => {
      window.clearInterval(timer);
      node.removeEventListener("pointerdown", pause);
      node.removeEventListener("touchstart", pause);
    };
  }, [reduceMotion, pageVisible, inView, list.length]);

  function goTo(i) {
    const node = scroller.current;
    if (!node) return;
    pauseUntil.current = Date.now() + 10000;
    node.scrollTo({ left: i * node.clientWidth, behavior: "smooth" });
  }

  if (!list.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {list.map((product, i) => (
          <SpotlightSlide key={product.id} product={product} priority={i === 0} />
        ))}
      </div>

      {list.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist" aria-label="Mall picks">
          {list.map((product, i) => (
            <button
              key={product.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show pick ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-5 bg-ink" : "w-1.5 bg-ink/25"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DesktopRail({ products }) {
  const reduceMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const scroller = useRef(null);
  const rootRef = useRef(null);
  const pauseUntil = useRef(0);
  const [inView, setInView] = useState(true);

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
    if (reduceMotion || !pageVisible || !inView) return undefined;
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
  }, [reduceMotion, pageVisible, inView, products]);

  const arrowClass =
    "absolute top-[38%] z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full " +
    "border-2 border-white bg-ink text-sun shadow-[0_6px_16px_-6px_rgb(15_23_42_/_0.5)] " +
    "ring-1 ring-ink/10 transition active:scale-95";

  return (
    <div ref={rootRef} className="relative py-1">
      <div
        ref={scroller}
        className="no-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain pb-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {products.map((product) => (
          <DeskCard key={product.id} product={product} />
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
        <ChevronLeft className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" />
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
        <ChevronRight className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Mall picks rail.
 * Mobile: one full-width spotlight + dots + gentle auto-advance.
 * Desktop: horizontal product rail with arrows.
 */
export function ProductMarquee({ products = [] }) {
  if (!products.length) return null;

  return (
    <>
      <div className="lg:hidden">
        <MobileSpotlight products={products} />
      </div>
      <div className="hidden lg:block">
        <DesktopRail products={products} />
      </div>
    </>
  );
}
