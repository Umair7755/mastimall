"use client";

import { useState } from "react";
import Image from "next/image";

function isRemoteSrc(src) {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

/** Product photos — remote admin URLs use a plain <img> so Next never blocks/retries them. */
export function ToyImage({ src, alt, sizes, className, priority = false }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <span className="absolute inset-0 grid place-items-center bg-brand-soft font-display text-3xl text-brand">
        {alt?.slice(0, 1) || "M"}
      </span>
    );
  }

  if (isRemoteSrc(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ""}
        className={`absolute inset-0 h-full w-full ${className || ""}`}
        loading={priority ? "eager" : "lazy"}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ""}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
