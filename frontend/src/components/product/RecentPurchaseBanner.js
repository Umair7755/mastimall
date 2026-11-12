"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ShoppingBag } from "lucide-react";

const BUYERS = [
  { name: "Ayesha", city: "Lahore" },
  { name: "Hassan", city: "Karachi" },
  { name: "Fatima", city: "Islamabad" },
  { name: "Omar", city: "Rawalpindi" },
  { name: "Sana", city: "Faisalabad" },
  { name: "Bilal", city: "Multan" },
  { name: "Zara", city: "Peshawar" },
  { name: "Usman", city: "Hyderabad" },
  { name: "Hira", city: "Sialkot" },
  { name: "Ali", city: "Gujranwala" },
];

function minutesAgo(seed) {
  return 2 + (seed % 18);
}

/** Soft social-proof toast: a “recent buyer” floats in while you browse a product. */
export function RecentPurchaseBanner({ productTitle = "this toy" }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  const order = useMemo(() => {
    const start = Math.abs(String(productTitle).length) % BUYERS.length;
    return Array.from({ length: BUYERS.length }, (_, i) => (start + i) % BUYERS.length);
  }, [productTitle]);

  useEffect(() => {
    if (reduce) return undefined;
    let showTimer;
    let hideTimer;
    let step = 0;

    function cycle() {
      setIndex(order[step % order.length]);
      setVisible(true);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        step += 1;
        showTimer = window.setTimeout(cycle, 4500 + (step % 3) * 900);
      }, 4200);
    }

    showTimer = window.setTimeout(cycle, 1800);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [order, reduce]);

  if (reduce) return null;

  const buyer = BUYERS[index] || BUYERS[0];
  const mins = minutesAgo(index + String(productTitle).length);

  return (
    <div className="pointer-events-none fixed bottom-24 left-3 z-40 max-w-[min(22rem,calc(100vw-1.5rem))] sm:left-5 lg:bottom-8">
      <AnimatePresence>
        {visible ? (
          <motion.aside
            key={`${buyer.name}-${index}`}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/80 bg-surface/95 p-3 shadow-lift backdrop-blur-xl"
            role="status"
            aria-live="polite"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sun text-ink shadow-soft">
              <ShoppingBag aria-hidden="true" size={18} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-semibold text-ink">
                {buyer.name} from {buyer.city}
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-ink-muted">
                just bought <span className="font-medium text-ink">{productTitle}</span>
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-wide text-brand">{mins} min ago</span>
            </span>
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6 }}
            />
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
