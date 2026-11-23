"use client";

import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { formatPkr } from "@/lib/format";

/** Live delivery-charges paragraph for legal / help pages. */
export function DeliveryChargesCopy() {
  const delivery = useCheckoutSettings();
  return (
    <>
      Delivery is free on orders of {formatPkr(delivery.freeShippingAt)} or more (after product discounts, before
      payment charges if any). For smaller orders, delivery is {formatPkr(delivery.nearFee)} in{" "}
      {delivery.nearCitiesLabel}, and {formatPkr(delivery.farFee)} for other cities. The final delivery fee is
      calculated on our server at checkout from your cart total and city — the amount shown in checkout is the fee
      that applies.
    </>
  );
}
