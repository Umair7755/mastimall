"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ToyImage } from "@/components/product/ToyImage";

export function Gallery({ product }) {
  const photos = product.images || [];
  const hasModel = Boolean(product.model3d?.glbUrl);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState("photos");
  const [Viewer, setViewer] = useState(null);
  const photo = photos[index] || photos[0];

  function open3D() {
    setTab("3d");
    if (Viewer) return;
    import("@/components/three/ProductViewer").then((mod) => setViewer(() => mod.default));
  }

  function onTouchEnd(event) {
    const start = Number(event.currentTarget.dataset.x || 0);
    const delta = event.changedTouches[0].clientX - start;
    if (delta > 40) setIndex((value) => (value - 1 + photos.length) % photos.length);
    if (delta < -40) setIndex((value) => (value + 1) % photos.length);
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          className={`min-h-12 rounded-full px-5 ${tab === "photos" ? "bg-brand-soft text-ink ring-2 ring-brand" : "bg-surface"}`}
          onClick={() => setTab("photos")}
        >
          Photos
        </button>
        {hasModel ? (
          <button
            type="button"
            className={`min-h-12 rounded-full px-5 ${tab === "3d" ? "bg-brand-soft text-ink ring-2 ring-brand" : "bg-surface"}`}
            onClick={open3D}
          >
            3D view
          </button>
        ) : null}
      </div>
      <div
        className="relative aspect-square overflow-hidden rounded-card bg-canvas"
        onTouchStart={(event) => {
          event.currentTarget.dataset.x = String(event.touches[0].clientX);
        }}
        onTouchEnd={onTouchEnd}
      >
        {tab === "3d" && hasModel ? (
          Viewer ? <Viewer url={product.model3d.glbUrl} /> : <p className="grid h-full place-items-center">Loading the 3D view…</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={photo?.url || "empty"}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ToyImage src={photo?.url} alt={photo?.alt || product.title} sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" priority />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      {photos.length > 1 && tab === "photos" ? (
        <div className="mt-3 flex gap-2">
          {photos.map((item, photoIndex) => (
            <button
              key={item.url}
              type="button"
              aria-label={`Photo ${photoIndex + 1}`}
              onClick={() => setIndex(photoIndex)}
              className={`relative h-16 w-16 overflow-hidden rounded-media border-2 ${photoIndex === index ? "border-brand" : "border-line"}`}
            >
              <ToyImage src={item.url} alt="" sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
