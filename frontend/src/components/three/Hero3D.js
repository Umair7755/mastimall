"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCan3D } from "@/hooks/useCan3D";
import { useInView } from "@/hooks/useInView";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function Hero3D() {
  const can3D = useCan3D();
  const frame = useRef(null);
  const visible = useInView(frame);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={frame}
      className="hero-stage relative h-[34vh] min-h-52 w-full overflow-hidden lg:h-[min(520px,52vh)] lg:min-h-[420px]"
      style={{ perspective: 900 }}
      initial={reduceMotion ? false : { opacity: 0, rotateX: 8, y: 18 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-6 rounded-[2rem] bg-gradient-to-br from-white/50 via-transparent to-brand/10 blur-xl" />

      {!can3D ? (
        <motion.div
          className="absolute inset-0"
          animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [0, 1.2, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/posters/hero.svg"
            alt="Toys and home décor floating together"
            fill
            priority
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-contain drop-shadow-lg"
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          <HeroScene active={visible} />
        </div>
      )}

    </motion.div>
  );
}
