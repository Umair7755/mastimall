"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { PictureTile } from "@/components/home/PictureTile";
import { useUi } from "@/store/ui";

export function ShopSheet({ departments = [] }) {
  const open = useUi((state) => state.shopOpen);
  const close = useUi((state) => state.closeShop);
  const reduce = useReducedMotion();
  const tiles = departments.flatMap((department) =>
    (department.categories || []).map((category) => ({
      ...category,
      href: `/${department.slug}/${category.slug}`,
    }))
  );

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 overflow-auto bg-canvas/95 backdrop-blur-xl"
          initial={{ y: reduce ? 0 : "100%" }}
          animate={{ y: 0 }}
          exit={{ y: reduce ? 0 : "100%" }}
          transition={reduce ? { duration: 0.01 } : { type: "spring", duration: 0.35, bounce: 0 }}
        >
          <div className="mx-auto w-full max-w-[1920px] px-2 py-5 pb-28 sm:px-3 lg:px-4 xl:px-5">
            <div className="flex items-center justify-between rounded-full border border-white/70 bg-surface/90 px-4 py-2 shadow-nav backdrop-blur">
              <h2 className="font-display text-2xl">All categories</h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-soft px-4 text-brand"
              >
                <X aria-hidden="true" size={18} />
                Close
              </button>
            </div>
            {tiles.length ? (
              <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {tiles.map((category) => (
                  <div key={category.id} className="rounded-card bg-surface/80 p-3 shadow-soft">
                    <PictureTile
                      href={category.href}
                      title={category.name}
                      image={category.image?.url}
                      color={category.color}
                      shape="circle"
                      onClick={close}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-ink-muted">Categories will show here once the shop is connected.</p>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
