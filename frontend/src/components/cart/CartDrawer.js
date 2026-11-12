"use client";

import { CartContents } from "@/components/cart/CartContents";
import { Drawer } from "@/components/ui/Drawer";
import { useCart } from "@/store/cart";

export function CartDrawer({ shopHref = "/" }) {
  const open = useCart((state) => state.drawerOpen);
  const closeDrawer = useCart((state) => state.closeDrawer);

  return (
    <Drawer open={open} onClose={closeDrawer} title="Your cart">
      <CartContents shopHref={shopHref} onKeep={closeDrawer} />
    </Drawer>
  );
}
