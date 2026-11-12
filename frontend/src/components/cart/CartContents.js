"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { CartLine } from "@/components/cart/CartLine";
import { useCartReady } from "@/hooks/useStoreReady";
import { useQuote } from "@/hooks/useQuote";
import { formatPkr } from "@/lib/format";
import { useCart } from "@/store/cart";

export function CartContents({ shopHref = "/", onKeep, checkout = "link" }) {
  const ready = useCartReady();
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const closeDrawer = useCart((state) => state.closeDrawer);
  const { quote, loading, error } = useQuote(items);
  const prices = new Map((quote?.lines || []).map((line) => [line.productId, line]));

  if (!ready) return <div className="skeleton h-40 rounded-card" />;

  if (!items.length) {
    return (
      <div className="py-8">
        <p className="font-display text-2xl">Your cart is empty. Pick a toy to start.</p>
        <ButtonLink href={shopHref} className="mt-6">
          Pick a toy
        </ButtonLink>
      </div>
    );
  }

  const footer = (
    <div className="grid gap-3">
      {error ? <p className="text-danger">{error}</p> : null}
      {quote?.problems?.map((problem) => (
        <p key={problem} className="text-danger">
          {problem}
        </p>
      ))}
      <div className="flex items-baseline justify-between">
        <span>Total</span>
        <span className="font-display text-2xl">{quote ? formatPkr(quote.total) : loading ? "…" : ""}</span>
      </div>
      {quote?.fee === 0 ? <p className="text-sm text-ink-muted">Delivery is free on this order.</p> : null}
      {quote?.fee > 0 ? (
        <p className="text-sm text-ink-muted">
          Delivery {formatPkr(quote.fee)}. Add {formatPkr(Math.max(0, quote.freeShippingAt - quote.subtotal))} more for free delivery.
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {onKeep ? (
          <Button variant="secondary" onClick={onKeep}>
            Keep shopping
          </Button>
        ) : (
          <ButtonLink href={shopHref} variant="secondary">
            Keep shopping
          </ButtonLink>
        )}
        {checkout === "link" ? (
          <ButtonLink href="/checkout" variant="primary" onClick={closeDrawer}>
            Checkout
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );

  return (
    <div>
      {items.map((item) => (
        <CartLine key={item.productId} item={item} priced={prices.get(item.productId)} onQty={setQty} onRemove={remove} />
      ))}
      <div className="pt-4">{footer}</div>
    </div>
  );
}
