"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, LayoutGrid, ShoppingBag, UserRound } from "lucide-react";
import { useCartReady } from "@/hooks/useStoreReady";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: null, label: "Shop", icon: LayoutGrid, shop: true },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/account", label: "Me", icon: UserRound },
];

function MobileNavInner() {
  const pathname = usePathname();
  const openShop = useUi((state) => state.openShop);
  const ready = useCartReady();
  const count = useCart((state) => state.items.reduce((sum, item) => sum + item.qty, 0));

  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 px-3 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 overflow-hidden rounded-full border border-white/70 bg-surface/95 px-1.5 shadow-nav backdrop-blur-xl sm:px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href && pathname === item.href;
          const className = `relative inline-flex flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-display ${
            active ? "text-brand" : "text-ink-muted"
          }`;
          if (item.shop) {
            return (
              <button key={item.label} type="button" className={className} onClick={openShop}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sun text-ink shadow-press-sun">
                  <Icon aria-hidden="true" size={18} />
                </span>
                {item.label}
              </button>
            );
          }
          return (
            <Link key={item.label} href={item.href} className={className}>
              <span className={`relative grid h-9 w-9 place-items-center rounded-full ${active ? "bg-brand-soft" : ""}`}>
                <Icon aria-hidden="true" size={18} />
                {item.label === "Cart" && ready && count > 0 ? (
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
