"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, LayoutGrid, ShoppingBag, UserRound } from "lucide-react";
import { useCartReady } from "@/hooks/useStoreReady";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

function MobileNavInner() {
  const pathname = usePathname();
  const openShop = useUi((state) => state.openShop);
  const shopOpen = useUi((state) => state.shopOpen);
  const openDrawer = useCart((state) => state.openDrawer);
  const ready = useCartReady();
  const count = useCart((state) => state.items.reduce((sum, item) => sum + item.qty, 0));

  const shopActive =
    shopOpen ||
    pathname.startsWith("/toys") ||
    pathname.startsWith("/decor") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/for/") ||
    pathname.startsWith("/age/") ||
    pathname.startsWith("/budget/");

  const items = [
    { key: "home", href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { key: "shop", label: "Shop", icon: LayoutGrid, shop: true, active: shopActive },
    { key: "cart", label: "Cart", icon: ShoppingBag, cart: true, active: pathname === "/cart" },
    { key: "me", href: "/account", label: "Me", icon: UserRound, active: pathname.startsWith("/account") },
  ];

  return (
    <nav
      className="fixed inset-x-0 z-40 px-3 lg:hidden"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 overflow-hidden rounded-full border border-white/70 bg-surface/95 px-1.5 shadow-nav backdrop-blur-xl sm:px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const className = `relative inline-flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-display ${
            item.active ? "text-brand" : "text-ink-muted"
          }`;

          if (item.shop) {
            return (
              <button key={item.key} type="button" className={className} onClick={openShop}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sun text-ink shadow-press-sun">
                  <Icon aria-hidden="true" size={18} />
                </span>
                {item.label}
              </button>
            );
          }

          if (item.cart) {
            return (
              <button key={item.key} type="button" className={className} onClick={openDrawer} aria-label="Open cart">
                <span className={`relative grid h-9 w-9 place-items-center rounded-full ${item.active ? "bg-brand-soft" : ""}`}>
                  <Icon aria-hidden="true" size={18} />
                  {ready && count > 0 ? (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] text-white"
                    >
                      {count}
                    </motion.span>
                  ) : null}
                </span>
                {item.label}
              </button>
            );
          }

          return (
            <Link key={item.key} href={item.href} className={className}>
              <span className={`relative grid h-9 w-9 place-items-center rounded-full ${item.active ? "bg-brand-soft" : ""}`}>
                <Icon aria-hidden="true" size={18} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavInner />
    </Suspense>
  );
}
