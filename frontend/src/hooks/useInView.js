"use client";

import { useEffect, useState } from "react";

/** True while the node is on screen. The hero uses this to pause WebGL. */
export function useInView(ref) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}
