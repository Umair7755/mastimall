"use client";

import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const FlyContext = createContext(() => {});

export function useFly() {
  return useContext(FlyContext);
}

export function FlyProvider({ children }) {
  const [flights, setFlights] = useState([]);
  const reduce = useReducedMotion();

  function fly(node) {
    if (reduce || !node) return;
    const source = node.tagName === "IMG" ? node : node.querySelector?.("img") || node;
    const from = source.getBoundingClientRect();
    const target = document.getElementById("cart-target");
    if (!target || !from.width) return;
    const to = target.getBoundingClientRect();
    const src = source.currentSrc || source.src || source.querySelector?.("img")?.currentSrc;
    if (!src) return;
    setFlights((list) => [
      ...list,
      {
        id: `${Date.now()}-${list.length}`,
        src,
        x: from.left,
        y: from.top,
        w: from.width,
        h: from.height,
        dx: to.left + to.width / 2 - (from.left + from.width / 2),
        dy: to.top + to.height / 2 - (from.top + from.height / 2),
      },
    ]);
  }

  return (
    <FlyContext.Provider value={fly}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[70]">
        <AnimatePresence>
          {flights.map((flight) => (
            <motion.img
              key={flight.id}
              src={flight.src}
              alt=""
              style={{ position: "fixed", left: flight.x, top: flight.y, width: flight.w, height: flight.h }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: flight.dx, y: flight.dy, scale: 0.2, opacity: 0.9 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => setFlights((list) => list.filter((item) => item.id !== flight.id))}
              className="rounded-media object-cover"
            />
          ))}
        </AnimatePresence>
      </div>
    </FlyContext.Provider>
  );
}
