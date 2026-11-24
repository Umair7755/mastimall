"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hand, SlidersHorizontal, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { ToyImage } from "@/components/product/ToyImage";
import { cn } from "@/lib/cn";

/** Only hide for the rest of the tab after the user actually opens Filters. */
const OPENED_KEY = "masti-find-filter-opened";

/**
 * Compact Find button (mobile) + bottom sheet of Who / Age / Type / Budget chips.
 * Pointing-hand overlays the button (no extra page gap).
 */
export function DepartmentFindControl({
  groups = [],
  title = "Find faster",
  seeAllHref = "/search",
  tone = "toys",
  showHandCue = true,
  /** Icon-only control for the sticky header (mobile). */
  variant = "default",
}) {
  const [open, setOpen] = useState(false);
  const [showCue, setShowCue] = useState(false);
  const reduceMotion = useReducedMotion();
  const isHeader = variant === "header";

  useEffect(() => {
    if (!showHandCue || isHeader || typeof window === "undefined") return undefined;
    try {
      if (window.sessionStorage.getItem(OPENED_KEY) === "1") return undefined;
    } catch {
      /* ignore */
    }
    setShowCue(true);
    const timer = window.setTimeout(() => setShowCue(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showHandCue, isHeader]);

  function openSheet() {
    setShowCue(false);
    try {
      window.sessionStorage.setItem(OPENED_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(true);
  }

  if (!groups.length) return null;

  const isDecor = tone === "decor";
  const isMall = tone === "mall";

  return (
    <>
      <div className="relative shrink-0">
        {isHeader ? (
          <button
            type="button"
            onClick={openSheet}
            aria-label="Find filters"
            aria-haspopup="dialog"
            aria-expanded={open}
            className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-ink text-sun shadow-sm transition active:scale-[0.96] sm:h-11 sm:w-11"
          >
            <SlidersHorizontal size={16} strokeWidth={2.35} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={openSheet}
            className={cn(
              "relative z-10 inline-flex h-11 items-center gap-2 rounded-full border px-1.5 pr-3 transition active:scale-[0.98]",
              isDecor
                ? "border-teal-200/80 bg-gradient-to-r from-[#ecfdf5] to-white"
                : isMall
                  ? "border-ink/15 bg-ink text-sun"
                  : "border-[#f59e0b]/40 bg-gradient-to-r from-[#fff7ed] via-white to-[#eef2ff]"
            )}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <span
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full",
                isDecor ? "bg-teal-800 text-sun" : isMall ? "bg-sun text-ink" : "bg-ink text-sun"
              )}
            >
              <SlidersHorizontal size={14} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <span className="flex flex-col items-start leading-none">
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-[0.14em]",
                  isMall ? "text-white/70" : "text-ink-muted"
                )}
              >
                Find
              </span>
              <span className={cn("font-display text-[13px] font-bold", isMall ? "text-sun" : "text-ink")}>
                Filters
              </span>
            </span>
          </button>
        )}

        <AnimatePresence>
          {showCue ? (
            <motion.button
              type="button"
              tabIndex={-1}
              onClick={openSheet}
              aria-label="Tap filters"
              className="absolute -left-1 top-[calc(100%-0.35rem)] z-30 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.15 }}
            >
              <motion.span
                className="relative grid h-9 w-9 place-items-center"
                animate={reduceMotion ? undefined : { y: [0, 4, 0], rotate: [-16, -6, -16] }}
                transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="absolute inset-0 rounded-full bg-sun/50 blur-md" aria-hidden="true" />
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white text-ink ring-2 ring-sun shadow-sm">
                  <Hand size={16} strokeWidth={2.5} className="-rotate-[20deg]" aria-hidden="true" />
                </span>
              </motion.span>
              <span className="mt-0.5 whitespace-nowrap rounded-full bg-ink px-1.5 py-px text-[9px] font-bold text-sun shadow-sm">
                Tap here
              </span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        side="bottom"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="min-h-10 flex-1" onClick={() => setOpen(false)}>
              Done
            </Button>
            <Link
              href={seeAllHref}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-brand px-4 font-display text-sm font-semibold text-white"
            >
              Browse all
            </Link>
          </div>
        }
      >
        <div className="space-y-3 pb-1">
          <p className="text-xs text-ink-muted">
            Tap a chip for matching {isDecor ? "décor" : isMall ? "toys & décor" : "toys"}.
          </p>

          {groups.map((group) => {
            const Icon = group.Icon || Sparkles;
            return (
              <section key={group.key}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-bold uppercase tracking-[0.06em] ring-1",
                      group.tone
                    )}
                  >
                    <Icon size={11} aria-hidden="true" strokeWidth={2.5} />
                    {group.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => {
                    const ChipIcon = item.ChipIcon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-black/5 bg-white px-1.5 pr-2.5",
                          item.emphasis === "age" && "border-[#f59e0b]/35 ring-1 ring-[#f59e0b]/20",
                          item.emphasis === "budget" && "border-[#059669]/35 ring-1 ring-[#059669]/20"
                        )}
                        style={{
                          background: `linear-gradient(145deg, ${item.color || "#fff"} 0%, #ffffff 78%)`,
                        }}
                      >
                        {item.image ? (
                          <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-white/80 ring-1 ring-black/5">
                            <ToyImage src={item.image} alt="" sizes="28px" className="object-contain p-0.5" />
                          </span>
                        ) : ChipIcon ? (
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/80 text-ink ring-1 ring-black/5">
                            <ChipIcon size={13} aria-hidden="true" />
                          </span>
                        ) : null}
                        <span className="flex flex-col">
                          <span
                            className={cn(
                              "font-display text-[12px] leading-none text-ink",
                              item.emphasis === "budget" ? "font-bold tabular-nums" : "font-semibold",
                              item.emphasis === "age" && "font-bold"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.sub ? (
                            <span
                              className={cn(
                                "mt-0.5 text-[8px] font-bold uppercase tracking-[0.06em]",
                                item.emphasis === "age" && "text-[#b45309]",
                                item.emphasis === "budget" && "text-[#047857]"
                              )}
                            >
                              {item.sub}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </Drawer>
    </>
  );
}
