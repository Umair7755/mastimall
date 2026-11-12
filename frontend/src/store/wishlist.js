"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

function snapshot(product) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    images: product.images || [],
    price: product.price,
    salePrice: product.salePrice,
    currentPrice: product.currentPrice,
    inStock: product.inStock,
    stock: product.stock,
    department: product.department,
    category: product.category,
  };
}

export const useWishlist = create(
  persist(
    (set) => ({
      items: [],
      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          return {
            items: exists ? state.items.filter((item) => item.id !== product.id) : [...state.items, snapshot(product)],
          };
        }),
    }),
    { name: "mastimall-wishlist" }
  )
);
