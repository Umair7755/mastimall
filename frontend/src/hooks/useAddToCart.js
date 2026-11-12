"use client";

import { useCart } from "@/store/cart";
import { useFly } from "@/components/cart/FlyToCart";

/** Add a toy, fly its picture to the cart, then open the drawer or show a toast. */
export function useAddToCart() {
  const addItem = useCart((state) => state.addItem);
  const openDrawer = useCart((state) => state.openDrawer);
  const notify = useCart((state) => state.notify);
  const fly = useFly();

  return function addToCart(product, qty = 1, node) {
    if (!product?.inStock) return;
    addItem(product, qty);
    fly(node);
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (wide) openDrawer();
    else notify("Added to cart");
  };
}
