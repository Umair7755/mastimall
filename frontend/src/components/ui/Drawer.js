"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Drawer({ open, onClose, title, side = "right", children, footer }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const isBottom = side === "bottom";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="pointer-events-auto fixed inset-0 z-[200]">
          <motion.div
            className="absolute inset-0 bg-ink/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "absolute flex flex-col overflow-hidden bg-white shadow-[0_-16px_48px_rgba(15,23,42,0.28)]",
              isBottom
                ? "inset-x-0 bottom-0 top-[max(3.5rem,env(safe-area-inset-top,0px))] rounded-t-[1.35rem]"
                : "inset-y-0 right-0 w-full max-w-md"
            )}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={reduce ? { duration: 0.01 } : { type: "spring", duration: 0.35, bounce: 0 }}
          >
            <div className="relative z-20 shrink-0 border-b border-slate-200 bg-white">
              {isBottom ? (
                <div className="flex justify-center pb-1 pt-3" aria-hidden="true">
                  <span className="h-1 w-9 rounded-full bg-slate-300" />
                </div>
              ) : null}

              <div className="flex items-center gap-3 px-4 pb-3.5 pt-1.5">
                <h2 className="min-w-0 flex-1 truncate font-display text-xl font-semibold leading-none text-ink">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close filters"
                  className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition hover:bg-slate-800 active:scale-95"
                >
                  <X size={20} strokeWidth={2.6} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto overscroll-contain bg-white px-4 py-3">
              {children}
            </div>

            {footer ? (
              <div
                className="relative z-20 shrink-0 border-t border-slate-200 bg-white px-4 pt-3"
                style={{
                  paddingBottom:
                    "calc(0.85rem + env(safe-area-inset-bottom, 0px) + var(--mobile-chrome-bottom, 0px))",
                }}
              >
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
