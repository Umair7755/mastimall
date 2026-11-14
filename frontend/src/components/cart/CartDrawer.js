"use client";

import { CartCheckoutFooter, CartContents } from "@/components/cart/CartContents";
import { Drawer } from "@/components/ui/Drawer";
import { useCart } from "@/store/cart";

export function CartDrawer({ shopHref = "/" }) {
  const open = useCart((state) => state.drawerOpen);
  const closeDrawer = useCart((state) => state.closeDrawer);
  const itemCount = useCart((state) => state.items.length);

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      title="Your cart"
      footer={
        itemCount ? <CartCheckoutFooter shopHref={shopHref} onKeep={closeDrawer} /> : null
      }
    >
      <CartContents shopHref={shopHref} onKeep={closeDrawer} hideFooter={itemCount > 0} />
    </Drawer>
  );
}
