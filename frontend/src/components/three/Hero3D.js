"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCan3D } from "@/hooks/useCan3D";
import { useInView } from "@/hooks/useInView";
import { usePageVisible } from "@/hooks/usePageVisible";
import { cn } from "@/lib/cn";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

function HeroPoster({ reduceMotion, mobile }) {
  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          "pointer-events-none absolute inset-4 rounded-[1.75rem] bg-gradient-to-br from-white/60 via-transparent to-brand/10",
          mobile ? "blur-md" : "blur-xl"
        )}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-0"
        animate={
          reduceMotion || mobile
            ? undefined
            : { y: [0, -6, 0] }
        }
        transition={
          reduceMotion || mobile
            ? undefined
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
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
    </div>
  );
}

export default function Hero3D() {
  const can3D = useCan3D();
  const frame = useRef(null);
  const visible = useInView(frame);
  const pageVisible = usePageVisible();
  const reduceMotion = useReducedMotion();
  const run3D = can3D && visible && pageVisible;

  return (
    <motion.div
      ref={frame}
      className="hero-stage relative h-[26vh] min-h-36 w-full overflow-hidden sm:min-h-44 lg:h-[min(520px,52vh)] lg:min-h-[420px]"
      style={can3D ? { perspective: 900 } : undefined}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {!can3D ? (
        <HeroPoster reduceMotion={reduceMotion} mobile />
      ) : (
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {run3D ? <HeroScene active /> : <HeroPoster reduceMotion={reduceMotion} mobile={false} />}
        </div>
      )}
    </motion.div>
  );
}
