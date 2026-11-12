"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { OrderCelebration } from "@/components/order/OrderCelebration";
import { OrderStatusTrack } from "@/components/order/OrderStatusTrack";
import { TrackForm } from "@/components/order/TrackForm";
import { formatPkr } from "@/lib/format";
import { cn } from "@/lib/cn";

export function OrderView({ orderNumber, order, error, placed }) {
  const [saved, setSaved] = useState(order);

  useEffect(() => {
    if (order) {
      setSaved(order);
      return;
    }
    try {
      const raw = sessionStorage.getItem("mastimall-last-order");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.orderNumber === orderNumber) setSaved(parsed);
    } catch {
      setSaved(null);
    }
  }, [order, orderNumber]);

  useEffect(() => {
    if (!placed) return;
    window.scrollTo(0, 0);
  }, [placed]);

  return (
    <div className={cn("mx-auto max-w-2xl px-4", placed ? "py-4 lg:py-5" : "py-8")}>
      {placed ? <OrderCelebration orderNumber={orderNumber} /> : null}

      {!placed ? (
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Order details</p>
          <h1 className="mt-1 font-display text-[32px] font-semibold lg:text-[40px]">Order {orderNumber}</h1>
        </div>
      ) : null}

      {saved ? (
        <div className={cn("grid", placed ? "gap-3" : "gap-4")}>
          <OrderStatusTrack status={saved.status} compact={placed} />

          <div className="overflow-hidden rounded-2xl border border-line/70 bg-white shadow-soft">
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-b border-line/60 bg-gradient-to-r from-[#f7f4ee] to-white",
                placed ? "px-4 py-2.5" : "px-5 py-4"
              )}
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Order number</p>
                <p className={cn("font-display font-semibold text-ink", placed ? "text-lg" : "mt-1 text-2xl")}>
                  {saved.orderNumber}
                </p>
              </div>
              <div className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-bold capitalize text-brand">
                {saved.status}
              </div>
            </div>

            {(saved.customer?.phone || saved.customer?.city) && !placed ? (
              <div className="grid gap-2 border-b border-line/60 px-5 py-4 text-sm text-ink-muted sm:grid-cols-2">
                {saved.customer?.phone ? (
                  <p className="inline-flex items-center gap-2">
                    <Phone size={14} aria-hidden="true" className="text-brand" />
                    {saved.customer.phone}
                  </p>
                ) : null}
                {saved.customer?.city || saved.customer?.address ? (
                  <p className="inline-flex items-start gap-2">
                    <MapPin size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                    <span>{[saved.customer?.city, saved.customer?.address].filter(Boolean).join(" · ")}</span>
                  </p>
                ) : null}
              </div>
            ) : null}

            {placed && saved.customer?.city ? (
              <p className="flex items-center gap-1.5 border-b border-line/50 px-4 py-2 text-xs text-ink-muted">
                <MapPin size={12} aria-hidden="true" className="text-brand" />
                {saved.customer.city}
              </p>
            ) : null}

            <ul className={cn("grid gap-0", placed ? "px-4 py-1" : "px-5 py-2")}>
              {saved.items?.map((item) => (
                <li
                  key={item.slug + item.title}
                  className={cn(
                    "flex items-center justify-between gap-3 border-b border-line/40 last:border-0",
                    placed ? "py-2" : "py-3"
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "grid shrink-0 place-items-center rounded-lg bg-brand-soft text-brand",
                        placed ? "h-8 w-8" : "h-9 w-9 rounded-xl"
                      )}
                    >
                      <ShoppingBag size={placed ? 13 : 15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
                      <span className="text-[11px] text-ink-muted">Qty {item.qty}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                    {formatPkr(item.unitPrice * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className={cn(
                "grid gap-1 border-t border-line/60 bg-[#faf8f4]",
                placed ? "px-4 py-2.5" : "gap-2 px-5 py-4"
              )}
            >
              <p className="flex justify-between text-xs text-ink-muted">
                <span>Delivery</span>
                <span>{saved.shipping?.fee ? formatPkr(saved.shipping.fee) : "Free"}</span>
              </p>
              {saved.payment?.method ? (
                <p className="flex justify-between text-xs text-ink-muted">
                  <span>Payment</span>
                  <span className="capitalize">
                    {saved.payment.method === "jazzcash"
                      ? "JazzCash"
                      : saved.payment.method === "easypaisa"
                        ? "EasyPaisa"
                        : saved.payment.method}
                    {saved.payment.receipt?.url ? " · receipt attached" : ""}
                  </span>
                </p>
              ) : null}
              <p className="flex items-baseline justify-between">
                <span className={cn("font-display font-semibold", placed ? "text-base" : "text-lg")}>Total</span>
                <span className={cn("font-display font-semibold text-brand", placed ? "text-xl" : "text-2xl")}>
                  {formatPkr(saved.total)}
                </span>
              </p>
            </div>

            <div className={cn("flex flex-wrap gap-2", placed ? "px-4 py-3" : "gap-3 px-5 py-4")}>
              <ButtonLink href="/track" variant="secondary" className={placed ? "min-h-10 px-3 text-sm" : undefined}>
                Track order
              </ButtonLink>
              <ButtonLink href="/" className={placed ? "min-h-10 px-3 text-sm" : undefined}>
                Continue shopping
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-[1.5rem] border border-line/70 bg-white p-5 shadow-soft">
          {error ? (
            <p className="mb-4 text-danger">{error}</p>
          ) : (
            <p className="mb-4 text-ink-muted">Enter the phone number from the order to see it.</p>
          )}
          <TrackForm orderNumber={orderNumber} />
        </div>
      )}
    </div>
  );
}
