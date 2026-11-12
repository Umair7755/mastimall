"use client";

import { useEffect, useState } from "react";

/** 3D is a bonus. Cheap phones, data saver, and reduced motion keep the poster. */
export function useCan3D() {
  const [can, setCan] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData === true;
    const weakCpu = (navigator.hardwareConcurrency ?? 4) <= 2;
    const lowMemory = (navigator.deviceMemory ?? 4) <= 2;

    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }

    setCan(webgl && !reduce && !saveData && !weakCpu && !lowMemory);
  }, []);

  return can;
}
