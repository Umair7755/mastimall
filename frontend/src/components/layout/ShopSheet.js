"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Armchair,
  Baby,
  Bike,
  Blocks,
  BookOpen,
  Car,
  ChevronRight,
  Flower2,
  Frame,
  Gamepad2,
  Gift,
  Image as ImageIcon,
  Lamp,
  Puzzle,
  Heart,
  Percent,
  Sofa,
  Trees,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useUi } from "@/store/ui";
import { cn } from "@/lib/cn";

/** Lucide icons by category slug — works for toys + décor without static SVGs. */
const CATEGORY_ICONS = {
  "remote-control": Car,
  "vehicles-and-ride-ons": Bike,
  "baby-toys": Baby,
  "dolls-and-pretend-play": Users,
  "building-and-puzzles": Blocks,
  "learning-and-creative": BookOpen,
  "outdoor-and-water-play": Trees,
  "games-and-fun": Gamepad2,
  "soft-toys": Heart,
  "gift-ideas": Gift,
  "wall-art": ImageIcon,
  "cushions-throws": Armchair,
  "lamps-lighting": Lamp,
  "vases-planters": Flower2,
  "frames-mirrors": Frame,
  "table-decor": UtensilsCrossed,
};

function categoryIcon(slug, departmentSlug) {
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
  if (departmentSlug === "decor") return Sofa;
  return Puzzle;
}

export function ShopSheet({ departments = [] }) {
  const open = useUi((state) => state.shopOpen);
  const close = useUi((state) => state.closeShop);
  const reduce = useReducedMotion();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const departmentParam = searchParams?.get("department") || "";

  const tabs = useMemo(
    () =>
      (departments.length ? departments : []).map((d) => ({
        slug: d.slug,
        name: d.name || d.slug,
        categories: d.categories || [],
      })),
    [departments]
  );

  const defaultTab = useMemo(() => {
    if (pathname.startsWith("/decor") || departmentParam === "decor") return "decor";
    if (pathname.startsWith("/toys") || departmentParam === "toys") return "toys";
    return tabs[0]?.slug || "toys";
  }, [pathname, departmentParam, tabs]);

  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const active = tabs.find((t) => t.slug === tab) || tabs[0];
  const isDecor = active?.slug === "decor";

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
          <div className="mobile-chrome-pad mx-auto w-full max-w-lg px-3 py-4 sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">Menu</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <Link
              href="/sales"
              onClick={close}
              className="mt-4 flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb7185] px-3.5 py-2.5 text-white shadow-[0_8px_20px_-10px_rgba(225,29,72,0.65)] ring-1 ring-white/20 transition active:scale-[0.99]"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 ring-1 ring-white/35">
                  <Percent size={18} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-display text-base font-bold">Sales</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85">
                    Hot deals · on sale now
                  </span>
                </span>
              </span>
              <span className="rounded-full bg-sun px-2.5 py-1 font-display text-[11px] font-black text-ink">
                SALE
              </span>
            </Link>

            {/* Top tabs — Toys / Decor */}
            <div
              role="tablist"
              aria-label="Departments"
              className="mt-3 grid grid-cols-2 gap-1 rounded-2xl border border-line/60 bg-white p-1 shadow-sm"
            >
              {tabs.map((item) => {
                const selected = item.slug === active?.slug;
                const Icon = item.slug === "decor" ? Sofa : Gift;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setTab(item.slug)}
                    className={cn(
                      "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition",
                      selected
                        ? item.slug === "decor"
                          ? "bg-teal-800 text-white"
                          : "bg-ink text-sun"
                        : "text-ink-muted"
                    )}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {active ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between px-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                    Categories
                  </p>
                  <Link
                    href={`/${active.slug}`}
                    onClick={close}
                    className="text-xs font-semibold text-brand"
                  >
                    View all
                  </Link>
                </div>

                <ul className="overflow-hidden rounded-2xl border border-line/60 bg-white shadow-sm">
                  {(active.categories || []).map((category, index) => {
                    const Icon = categoryIcon(category.slug, active.slug);
                    return (
                      <li key={category.id || category.slug}>
                        <Link
                          href={`/${active.slug}/${category.slug}`}
                          prefetch={false}
                          onClick={close}
                          className={cn(
                            "flex min-h-12 items-center gap-3 px-3 py-2.5 transition active:bg-canvas",
                            index > 0 && "border-t border-line/50"
                          )}
                        >
                          <span
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                            style={{ backgroundColor: category.color || (isDecor ? "#ecfdf5" : "#eef2ff") }}
                          >
                            <Icon size={18} strokeWidth={2.2} className="text-ink" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1 font-display text-[15px] font-semibold text-ink">
                            {category.name}
                          </span>
                          <ChevronRight size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {!active.categories?.length ? (
                  <p className="mt-4 text-sm text-ink-muted">No categories in this section yet.</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-8 text-sm text-ink-muted">Categories will show here once the shop is connected.</p>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
