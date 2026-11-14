"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Gift, Sofa, X } from "lucide-react";
import { PictureTile } from "@/components/home/PictureTile";
import { useUi } from "@/store/ui";

export function ShopSheet({ departments = [] }) {
  const open = useUi((state) => state.shopOpen);
  const close = useUi((state) => state.closeShop);
  const reduce = useReducedMotion();

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
          <div className="mobile-chrome-pad mx-auto w-full max-w-[1920px] px-2 py-5 sm:px-3 lg:px-4 xl:px-5">
            <div className="flex items-center justify-between rounded-full border border-white/70 bg-surface/90 px-4 py-2 shadow-nav backdrop-blur">
              <h2 className="font-display text-2xl">Browse the mall</h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-soft px-4 text-brand"
              >
                <X aria-hidden="true" size={18} />
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/toys"
                onClick={close}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#4f46e5] px-4 text-sm font-semibold text-white"
              >
                <Gift size={15} aria-hidden="true" />
                All toys
              </Link>
              <Link
                href="/decor"
                onClick={close}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-teal-700 px-4 text-sm font-semibold text-white"
              >
                <Sofa size={15} aria-hidden="true" />
                All décor
              </Link>
            </div>

            {departments.length ? (
              <div className="mt-6 space-y-8">
                {departments.map((department) => (
                  <section key={department.id || department.slug}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="font-display text-xl font-semibold text-ink">{department.name}</h3>
                      <Link
                        href={`/${department.slug}`}
                        onClick={close}
                        className="text-sm font-semibold text-brand hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {(department.categories || []).map((category) => (
                        <div key={category.id} className="rounded-card bg-surface/80 p-3 shadow-soft">
                          <PictureTile
                            href={`/${department.slug}/${category.slug}`}
                            title={category.name}
                            image={category.image?.url}
                            color={category.color}
                            shape="circle"
                            onClick={close}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
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
