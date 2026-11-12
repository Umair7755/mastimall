"use client";

import { FlyProvider } from "@/components/cart/FlyToCart";
import { Toast } from "@/components/cart/Toast";

export function Providers({ children }) {
  return (
    <FlyProvider>
      {children}
      <Toast />
    </FlyProvider>
  );
}
