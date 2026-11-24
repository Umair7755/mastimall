"use client";

import { useEffect, useState } from "react";

/**
 * 3D is a desktop bonus only.
 * Phones/tablets always get the static poster — WebGL is the main heat source.
 */
export function useCan3D() {
  const [can, setCan] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const saveData = navigator.connection?.saveData === true;
    const weakCpu = (navigator.hardwareConcurrency ?? 4) <= 4;
    const lowMemory = (navigator.deviceMemory ?? 8) <= 4;

    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }

    // Mobile / touch: never mount Three.js.
    if (narrow || coarse) {
      setCan(false);
      return;
    }

    setCan(webgl && !reduce && !saveData && !weakCpu && !lowMemory);
  }, []);

  return can;
}
