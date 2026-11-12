"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/browser";
import { CITIES, PAYMENT_METHODS } from "@/lib/constants";

export function useCheckoutSettings() {
  const [settings, setSettings] = useState({
    cities: CITIES,
    paymentMethods: PAYMENT_METHODS,
    freeShippingAt: 3000,
  });

  useEffect(() => {
    apiFetch("/settings/checkout")
      .then((data) => {
        setSettings({
          cities: data.cities?.length ? data.cities : CITIES,
          paymentMethods: data.paymentMethods?.length ? data.paymentMethods : PAYMENT_METHODS,
          freeShippingAt: data.freeShippingAt || 3000,
        });
      })
      .catch(() => {});
  }, []);

  return settings;
}
