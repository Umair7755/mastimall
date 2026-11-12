"use client";

import { useEffect } from "react";
import { Rocket, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

function burst(confetti, opts) {
  confetti({
    particleCount: 55,
    spread: 60,
    startVelocity: 32,
    ticks: 180,
    gravity: 0.95,
    colors: ["#4F46E5", "#FBBF24", "#FB7185", "#22C55E", "#38BDF8"],
    ...opts,
  });
}

/** Compact celebration banner for a freshly placed order. */
export function OrderCelebration({ orderNumber }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (reduceMotion) return undefined;
    const key = `mastimall-confetti-${orderNumber}`;
    if (sessionStorage.getItem(key)) return undefined;
    sessionStorage.setItem(key, "1");

    let cancelled = false;
    const timers = [];

    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      burst(confetti, { origin: { x: 0.2, y: 0.1 } });
      burst(confetti, { origin: { x: 0.8, y: 0.1 } });
      timers.push(
        window.setTimeout(() => {
          burst(confetti, { origin: { x: 0.5, y: 0.12 }, particleCount: 80, spread: 90 });
        }, 350)
      );
    });

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [orderNumber, reduceMotion]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="relative mb-3 overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-r from-[#312e81] via-[#4f46e5] to-[#db2777] px-4 py-3 text-white shadow-soft sm:px-5 sm:py-3.5"
    >
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute"
          initial={{ x: -24, y: 36, opacity: 0, rotate: -30 }}
          animate={{ x: [ -24, 140, 280 ], y: [36, 0, -40], opacity: [0, 1, 0], rotate: -30 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          aria-hidden="true"
        >
          <Rocket className="text-sun" size={22} strokeWidth={2.2} />
        </motion.div>
      ) : null}

      <div className="relative flex items-center gap-3">
        <motion.span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 text-sun"
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Rocket size={24} strokeWidth={2.2} aria-hidden="true" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sun">
            <Sparkles size={12} aria-hidden="true" />
            Congratulations
          </p>
          <h1 className="font-display text-xl font-semibold leading-tight sm:text-2xl">Order placed!</h1>
          <p className="mt-0.5 truncate text-xs text-white/85 sm:text-sm">
            Shukriya — WhatsApp confirm soon · <span className="font-semibold text-sun">{orderNumber}</span>
          </p>
        </div>
      </div>
    </motion.section>
  );
}
