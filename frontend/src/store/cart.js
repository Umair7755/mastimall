"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productPath } from "@/lib/paths";

export const useCart = create(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      notice: "",
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      notify: (notice) => set({ notice }),
      clearNotice: () => set({ notice: "" }),
      addItem: (product, qty = 1) =>
        set((state) => {
          const items = [...state.items];
          const index = items.findIndex((item) => item.productId === product.id);
          const current = index >= 0 ? items[index].qty : 0;
          const cap = Math.min(20, product.stock > 0 ? product.stock : 20);
          const line = {
            productId: product.id,
            title: product.title,
            slug: product.slug,
            href: productPath(product),
            image: product.images?.[0]?.url || "",
            qty: Math.min(cap, current + qty),
          };
          if (index >= 0) items[index] = line;
          else items.push(line);
          return { items };
        }),
      setQty: (productId, qty) =>
        set((state) => ({
          items:
            qty < 1
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, qty: Math.min(20, qty) } : item
                ),
        })),
      remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
      /** Replace cart from a server resume link (WhatsApp / SMS). */
      replaceItems: (nextItems = []) =>
        set({
          items: (Array.isArray(nextItems) ? nextItems : [])
            .filter((item) => item?.productId)
            .map((item) => ({
              productId: String(item.productId),
              title: String(item.title || ""),
              slug: String(item.slug || ""),
              href: String(item.href || ""),
              image: String(item.image || ""),
              qty: Math.min(20, Math.max(1, Number(item.qty) || 1)),
            })),
        }),
    }),
    {
      name: "mastimall-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
