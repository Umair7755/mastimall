"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AskParentButton } from "@/components/product/AskParentButton";
import { NotifyForm } from "@/components/product/NotifyForm";
import { PriceTag } from "@/components/product/PriceTag";
import { QtyStepper } from "@/components/product/QtyStepper";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { ageLabel } from "@/lib/constants";
import { formatPkr } from "@/lib/format";
import { productPath } from "@/lib/paths";

export function BuyBox({ product }) {
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();
  const delivery = useCheckoutSettings();
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

      <AskParentButton product={product} href={href} />

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

      <div className="rounded-card bg-brand-soft p-4 text-ink">
        <p>COD, JazzCash &amp; EasyPaisa. Free delivery from {formatPkr(delivery.freeShippingAt)}.</p>
        <p className="mt-1 text-sm">
          {formatPkr(delivery.nearFee)} in {delivery.nearCitiesLabel}. {formatPkr(delivery.farFee)} in other cities.
        </p>
        {product.fragile ? <p className="mt-2">This one is packed with extra care.</p> : null}
      </div>
    </div>
  );
}
