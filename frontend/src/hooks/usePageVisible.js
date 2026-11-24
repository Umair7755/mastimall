"use client";

import { useEffect, useState } from "react";

/** False when the browser tab is hidden — use to pause timers/WebGL. */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function sync() {
      setVisible(document.visibilityState !== "hidden");
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return visible;
}
