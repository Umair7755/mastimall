"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const RATIO = 760 / 296;

/** Animated Masti Mall mark — official PNG + soft motion on the toy blocks feel. */
export function MastiLogo({ className, height = 44, priority = false, title = "Masti Mall" }) {
  const reduceMotion = useReducedMotion();
  const width = Math.round(height * RATIO);

  return (
    <motion.span
      className={cn("masti-logo relative inline-flex shrink-0 items-center", className)}
      style={{ aspectRatio: String(RATIO), width: "auto", height }}
      aria-label={title}
      animate={reduceMotion ? undefined : { y: [0, -1.5, 0] }}
      transition={reduceMotion ? undefined : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image
        src="/brand/masti-mall-logo.png"
        alt={title}
        width={760}
        height={296}
        priority={priority}
        className="h-full w-full object-contain object-left drop-shadow-[0_2px_8px_rgb(67_56_202_/_0.18)]"
      />

      {!reduceMotion ? (
        <>
          <span className="masti-sparkle masti-sparkle--a" aria-hidden="true" />
          <span className="masti-sparkle masti-sparkle--b" aria-hidden="true" />
          <span className="masti-sparkle masti-sparkle--c" aria-hidden="true" />
        </>
      ) : null}
    </motion.span>
  );
}
