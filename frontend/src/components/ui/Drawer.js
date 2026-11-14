"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

export function Drawer({ open, onClose, title, side = "right", children, footer }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const hidden = side === "bottom" ? { y: "100%" } : { x: "100%" };
  const shown = side === "bottom" ? { y: 0 } : { x: 0 };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={
              side === "bottom"
                ? "absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-card bg-surface"
                : "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface"
            }
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={reduce ? { duration: 0.01 } : { type: "spring", duration: 0.35, bounce: 0 }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <h2 className="font-display text-2xl">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-12 items-center gap-2 rounded-full px-3"
              >
                <X aria-hidden="true" />
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">{children}</div>
            {footer ? (
              <div
                className="border-t border-line bg-surface p-4"
                style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
              >
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
