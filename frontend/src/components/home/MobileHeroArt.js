"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/** Compact mobile hero visual — transparent art, inset from the card edge. */
export function MobileHeroArt() {
  const reduce = useReducedMotion();

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <motion.div
        className="absolute inset-[6px] bg-transparent"
        initial={reduce ? false : { opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative h-full w-full bg-transparent"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={reduce ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/posters/hero.svg"
            alt=""
            fill
            priority
            unoptimized
            sizes="40vw"
            className="bg-transparent object-contain object-center"
            style={{ background: "transparent" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
