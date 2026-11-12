"use client";

import { create } from "zustand";

export const useUi = create((set) => ({
  shopOpen: false,
  openShop: () => set({ shopOpen: true }),
  closeShop: () => set({ shopOpen: false }),
}));
