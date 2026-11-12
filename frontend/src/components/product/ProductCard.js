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

export function ProductCard({ product, hot = false, index = 0 }) {
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
          className="absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-soft"
        >
          <Heart className={saved ? "fill-coral text-coral" : ""} aria-hidden="true" size={16} />
        </motion.button>

        <Link href={href} prefetch={false} className="block">
          <div
            ref={mediaRef}
            className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-[#fff7ec] via-[#f3f0ff] to-[#ffe8f1]"
          >
            <ToyImage
              src={image?.url}
              alt={image?.alt || product.title}
              sizes="(min-width: 1024px) 22vw, 48vw"
              className="object-contain p-4 transition duration-300 group-hover:scale-105"
            />

            {hot ? (
              <div className="absolute left-2.5 top-2.5 z-[1] flex items-start gap-1.5">
                <PriceRibbon
                  label={onSale ? "SALE" : "FROM"}
                  value={formatPkr(price).replace("Rs ", "Rs. ")}
                  color={RIBBON_COLORS[index % RIBBON_COLORS.length]}
                />
                {product.isNew && !onSale ? <Badge tone="new">New</Badge> : null}
              </div>
            ) : (
              <div className="absolute left-2.5 top-2.5 z-[1] flex items-center gap-1">
                {product.isNew ? <Badge tone="new">New</Badge> : null}
                {onSale ? <Badge tone="sale">Sale</Badge> : null}
              </div>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 min-h-[2.5em] px-3 font-display text-base font-semibold leading-snug text-ink sm:text-lg">
            {product.title}
          </h3>
        </Link>
        {(product.ratingCount > 0 || product.ratingAvg > 0) ? (
          <div className="px-3 pt-1">
            <StarRating value={product.ratingAvg} count={product.ratingCount} size={14} />
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 px-3 pb-3 pt-1">
        <PriceTag price={product.price} salePrice={product.salePrice} currentPrice={product.currentPrice} />
        {product.inStock ? (
          <Button
            variant="sun"
            className="w-full"
            onClick={() => addToCart(product, 1, mediaRef.current)}
          >
            <ShoppingBag aria-hidden="true" size={16} />
            Add to cart
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
