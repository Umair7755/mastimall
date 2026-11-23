"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/browser";
import { CITIES, DELIVERY, PAYMENT_METHODS } from "@/lib/constants";

function formatNearCities(list) {
  const cities = Array.isArray(list) ? list.filter(Boolean) : [];
  if (!cities.length) return DELIVERY.nearCities;
  if (cities.length === 1) return cities[0];
  if (cities.length === 2) return `${cities[0]} and ${cities[1]}`;
  return `${cities.slice(0, -1).join(", ")}, and ${cities[cities.length - 1]}`;
}

const DEFAULTS = {
  cities: CITIES,
  paymentMethods: PAYMENT_METHODS,
  freeShippingAt: DELIVERY.freeAt,
  nearFee: DELIVERY.nearFee,
  farFee: DELIVERY.farFee,
  nearCities: [...DELIVERY.nearCitiesList],
  nearCitiesLabel: DELIVERY.nearCities,
};

export function useCheckoutSettings() {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    apiFetch("/settings/checkout")
      .then((data) => {
        const nearCities =
          Array.isArray(data.nearCities) && data.nearCities.length
            ? data.nearCities
            : [...DELIVERY.nearCitiesList];
        setSettings({
          cities: data.cities?.length ? data.cities : CITIES,
          paymentMethods: data.paymentMethods?.length ? data.paymentMethods : PAYMENT_METHODS,
          freeShippingAt: data.freeShippingAt ?? DELIVERY.freeAt,
          nearFee: data.nearFee ?? DELIVERY.nearFee,
          farFee: data.farFee ?? DELIVERY.farFee,
          nearCities,
          nearCitiesLabel: formatNearCities(nearCities),
        });
      })
      .catch(() => {});
  }, []);

  return settings;
}
