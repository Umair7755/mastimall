"use client";

import Link from "next/link";
import { useRef } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { Badge, PriceRibbon } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/product/PriceTag";
import { StarRating } from "@/components/product/StarRating";
import { ToyImage } from "@/components/product/ToyImage";
import { useAddToCart } from "@/hooks/useAddToCart";
import { formatPkr } from "@/lib/format";
import { productPath } from "@/lib/paths";
import { useWishlist } from "@/store/wishlist";

const RIBBON_COLORS = ["#2563EB", "#DB2777", "#059669", "#EA580C", "#7C3AED"];

export function ProductCard({ product, hot = false, index = 0, compact = false }) {
  const mediaRef = useRef(null);
  const addToCart = useAddToCart();
  const saved = useWishlist((state) => state.items.some((item) => item.id === product.id));
  const toggle = useWishlist((state) => state.toggle);
  const href = productPath(product);
  const image = product.images?.[0];
  const price = product.currentPrice ?? product.salePrice ?? product.price;
  const onSale = product.salePrice > 0 && product.salePrice < product.price;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/60 bg-white shadow-soft transition duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lift">
      <div className="relative">
        <motion.button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Saved" : "Save"}
          onClick={() => toggle(product)}
          whileTap={{ scale: 0.88 }}
          className={`absolute z-10 grid place-items-center rounded-full bg-white/95 text-ink shadow-soft ${
            compact ? "right-1.5 top-1.5 h-7 w-7" : "right-2.5 top-2.5 h-9 w-9"
          }`}
        >
          <Heart className={saved ? "fill-coral text-coral" : ""} aria-hidden="true" size={compact ? 13 : 16} />
        </motion.button>

        <Link href={href} prefetch={false} className="block">
          <div
            ref={mediaRef}
            className={`relative overflow-hidden bg-gradient-to-br from-[#fff7ec] via-[#f3f0ff] to-[#ffe8f1] ${
              compact ? "aspect-square" : "aspect-[5/4]"
            }`}
          >
            <ToyImage
              src={image?.url}
              alt={image?.alt || product.title}
              sizes={compact ? "(min-width: 1024px) 14vw, 42vw" : "(min-width: 1024px) 22vw, 48vw"}
              className={`object-contain transition duration-300 group-hover:scale-105 ${compact ? "p-2.5" : "p-4"}`}
            />

            {hot ? (
              <div className={`absolute z-[1] flex items-start gap-1.5 ${compact ? "left-1.5 top-1.5" : "left-2.5 top-2.5"}`}>
                <PriceRibbon
                  label={onSale ? "SALE" : "FROM"}
                  value={formatPkr(price).replace("Rs ", "Rs. ")}
                  color={RIBBON_COLORS[index % RIBBON_COLORS.length]}
                />
                {product.isNew && !onSale ? <Badge tone="new">New</Badge> : null}
              </div>
            ) : (
              <div className={`absolute z-[1] flex items-center gap-1 ${compact ? "left-1.5 top-1.5" : "left-2.5 top-2.5"}`}>
                {product.isNew ? <Badge tone="new">New</Badge> : null}
                {onSale ? <Badge tone="sale">Sale</Badge> : null}
              </div>
            )}
          </div>

          <h3
            className={`line-clamp-2 font-display font-semibold leading-snug text-ink ${
              compact
                ? "mt-1.5 min-h-[2.2em] px-2 text-[13px] sm:text-sm"
                : "mt-3 min-h-[2.5em] px-3 text-base sm:text-lg"
            }`}
          >
            {product.title}
          </h3>
        </Link>
        {product.ratingCount > 0 || product.ratingAvg > 0 ? (
          <div className={compact ? "px-2 pt-0.5" : "px-3 pt-1"}>
            <StarRating value={product.ratingAvg} count={product.ratingCount} size={compact ? 11 : 14} />
          </div>
        ) : null}
      </div>

      <div className={`mt-auto flex flex-col ${compact ? "gap-1.5 px-2 pb-2 pt-0.5" : "gap-2.5 px-3 pb-3 pt-1"}`}>
        <PriceTag
          price={product.price}
          salePrice={product.salePrice}
          currentPrice={product.currentPrice}
          compact={compact}
        />
        {product.inStock ? (
          <Button
            variant="sun"
            className={`w-full !bg-[#fbbf24] !text-ink hover:!brightness-105 ${compact ? "!min-h-10 !px-2 !text-xs" : ""}`}
            onClick={() => addToCart(product, 1, mediaRef.current)}
          >
            <ShoppingBag aria-hidden="true" size={compact ? 14 : 16} />
            {compact ? "Add" : "Add to cart"}
          </Button>
        ) : (
          <Badge tone="danger" className="self-start">
            Sold out
          </Badge>
        )}
      </div>
    </article>
  );
}
