"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

let scriptPromise = null;

function livingLogoApi() {
  return typeof window !== "undefined" ? window.MastiLogo : null;
}

function loadLivingLogoScript() {
  if (typeof window === "undefined") return Promise.resolve(null);
  const ready = livingLogoApi();
  if (ready?.mount) return Promise.resolve(ready);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-masti-living-logo]");
      if (existing) {
        const done = () => resolve(livingLogoApi());
        if (livingLogoApi()?.mount) done();
        else existing.addEventListener("load", done, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "/brand/masti-mall-logo.js";
      script.async = true;
      script.dataset.mastiLivingLogo = "1";
      script.onload = () => resolve(livingLogoApi());
      script.onerror = () => reject(new Error("Failed to load Masti Mall logo"));
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

/**
 * Living Masti Mall logo (same brand mark on mobile + desktop).
 */
export function MastiLogo({
  className,
  height = 72,
  title = "Masti Mall",
  slogan = "moods",
  orbit = true,
  tagline = false,
  theme,
  mode,
  priority = false,
}) {
  const hostRef = useRef(null);
  void priority;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let cancelled = false;

    loadLivingLogoScript()
      .then((api) => {
        if (cancelled || !hostRef.current || !api?.mount) return;
        host.innerHTML = "";
        delete host.__mm;
        api.mount(host.parentElement || document);
      })
      .catch(() => {
        /* keep empty host — brand still has aria-label */
      });

    return () => {
      cancelled = true;
      if (host) {
        host.innerHTML = "";
        delete host.__mm;
      }
    };
  }, [slogan, orbit, tagline, theme, mode]);

  const ratio =
    mode === "icon"
      ? 1
      : slogan !== "none" && tagline
        ? 760 / 318
        : slogan !== "none"
          ? 760 / 292
          : 760 / 240;
  const width = mode === "icon" ? height : Math.round(height * ratio);

  return (
    <span
      className={cn("masti-logo relative inline-flex shrink-0 items-center justify-start overflow-visible", className)}
      style={{ width, height, maxWidth: "100%", aspectRatio: `${ratio} / 1` }}
      aria-label={title}
      role="img"
    >
      <div
        ref={hostRef}
        data-masti-logo=""
        data-slogan={slogan}
        data-orbit={orbit ? "true" : "false"}
        data-tagline={tagline ? "true" : "false"}
        {...(theme ? { "data-theme": theme } : {})}
        {...(mode ? { "data-mode": mode } : {})}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </span>
  );
}
