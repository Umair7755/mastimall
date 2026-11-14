"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AskParentButton, NotifyForm } from "@/components/product/NotifyForm";
import { PriceTag } from "@/components/product/PriceTag";
import { QtyStepper } from "@/components/product/QtyStepper";
import { useAddToCart } from "@/hooks/useAddToCart";
import { DELIVERY, ageLabel } from "@/lib/constants";
import { formatPkr } from "@/lib/format";
import { productPath } from "@/lib/paths";

export function BuyBox({ product }) {
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();
  const href = productPath(product);
  const adult = product.ageBands?.every((band) => band === "12-plus");
  const max = Math.min(20, product.stock || 20);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {product.ageBands?.map((band) => (
          <Badge key={band} tone="neutral">
            Ages {ageLabel(band)}
          </Badge>
        ))}
        {product.inStock ? <Badge tone="success">In stock</Badge> : <Badge tone="danger">Sold out right now</Badge>}
      </div>
      {adult ? <p className="rounded-2xl bg-sun px-4 py-3 text-ink">For ages 12 and up.</p> : null}
      <PriceTag price={product.price} salePrice={product.salePrice} currentPrice={product.currentPrice} />
      {product.brand ? <p className="text-ink-muted">{product.brand}</p> : null}
      {product.inStock ? (
        <div className="flex flex-wrap items-center gap-3">
          <QtyStepper qty={qty} max={max} onChange={setQty} />
          <Button
            variant="sun"
            className="min-w-48 flex-1 !bg-[#fbbf24] !text-ink hover:!brightness-105"
            onClick={(event) => addToCart(product, qty, event.currentTarget.closest("div"))}
          >
            Add to cart
          </Button>
        </div>
      ) : (
        <NotifyForm productId={product.id} />
      )}
      <AskParentButton product={product} href={href} />
      <div className="rounded-card bg-brand-soft p-4 text-ink">
        <p>COD, JazzCash &amp; EasyPaisa. Free delivery from {formatPkr(DELIVERY.freeAt)}.</p>
        <p className="mt-1 text-sm">
          {formatPkr(DELIVERY.nearFee)} in {DELIVERY.nearCities}. {formatPkr(DELIVERY.farFee)} in other cities.
        </p>
        {product.fragile ? <p className="mt-2">This one is packed with extra care.</p> : null}
      </div>

      <div
        className="fixed inset-x-0 z-30 border-t border-line bg-surface/95 px-3 py-2.5 shadow-nav backdrop-blur-xl lg:hidden"
        style={{ bottom: "var(--mobile-chrome-bottom)" }}
      >
        {product.inStock ? (
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white p-0.5">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-40"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                aria-label="Fewer"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="min-w-7 text-center font-display text-base font-semibold" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-40"
                onClick={() => setQty(Math.min(max, qty + 1))}
                disabled={qty >= max}
                aria-label="More"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <Button
              variant="sun"
              className="min-h-11 flex-1 !bg-[#fbbf24] !text-ink hover:!brightness-105"
              onClick={() => addToCart(product, qty)}
            >
              Add · {formatPkr(product.currentPrice ?? product.salePrice ?? product.price)}
            </Button>
          </div>
        ) : (
          <p className="text-center font-display text-lg">Sold out right now</p>
        )}
      </div>
    </div>
  );
}
