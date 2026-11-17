"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Hand, Sparkles } from "lucide-react";
import { ToyImage } from "@/components/product/ToyImage";
import { CONTAINER } from "@/lib/layout";
import { cn } from "@/lib/cn";

/**
 * Filter rail. Default = single horizontal line (Toys/Decor).
 * `variant="home"` = mobile-friendly tabbed chips (desktop keeps two clean rows).
 */
export function FindMallRail({
  groups = [],
  id = "find",
  title = "Find faster",
  subtitle = "Tap a filter",
  mobileLabel = "Tap a chip",
  seeAllHref = "/search",
  shell = "border-line/60 bg-gradient-to-r from-[#fff4e0] via-white to-[#ebe7ff]",
  variant = "line",
}) {
  const reduceMotion = useReducedMotion();
  const [showHand, setShowHand] = useState(true);

  useEffect(() => {
    if (reduceMotion || variant === "home") {
      setShowHand(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setShowHand(false), 12000);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, variant]);

  if (!groups.length) return null;

  if (variant === "home") {
    return (
      <HomeFinderBoard
        id={id}
        groups={groups}
        title={title}
        subtitle={subtitle}
        seeAllHref={seeAllHref}
        shell={shell}
        reduceMotion={reduceMotion}
      />
    );
  }

  return (
    <section id={id} className={`${CONTAINER} max-w-full scroll-mt-28 overflow-x-hidden py-1.5 lg:py-2`}>
      <div className={`relative max-w-full overflow-hidden rounded-[1.15rem] border px-2 py-1.5 shadow-soft sm:px-2.5 sm:py-2 ${shell}`}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-sun/30 blur-2xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-12 w-12 rounded-full bg-brand/20 blur-2xl"
        />

        <div className="relative flex min-w-0 max-w-full items-center gap-2">
          <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-sun">
              <Sparkles size={13} aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</p>
              <p className="font-display text-xs font-semibold text-ink">{subtitle}</p>
            </div>
          </div>

          <div className="relative min-w-0 max-w-full flex-1">
            <div className="mb-1 flex items-center justify-between gap-2 lg:hidden">
              <p className="font-display text-xs font-semibold text-ink">{mobileLabel}</p>
              <Link href={seeAllHref} className="text-[11px] font-semibold text-brand">
                All
              </Link>
            </div>

            <div
              className="no-scrollbar relative max-w-full overflow-x-auto overscroll-x-contain py-0.5"
              onPointerDown={() => setShowHand(false)}
            >
              <div className="flex w-max items-center gap-1.5 pr-1.5">
                {groups.map((group, groupIndex) => (
                  <GroupStrip
                    key={group.key}
                    group={group}
                    groupIndex={groupIndex}
                    showDivider={groupIndex > 0}
                    reduceMotion={reduceMotion}
                  />
                ))}
                <Link
                  href={seeAllHref}
                  className="ml-0.5 inline-flex h-8 shrink-0 items-center rounded-full border border-brand/20 bg-white px-2.5 text-[11px] font-semibold text-brand shadow-sm"
                >
                  All
                </Link>
              </div>
            </div>

            {showHand && !reduceMotion ? <TapHandCue onDone={() => setShowHand(false)} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Home finder — mobile: one tab at a time with wrapping chips; desktop: two short rows. */
function HomeFinderBoard({ id, groups, title, subtitle, seeAllHref, shell, reduceMotion }) {
  const tabs = useMemo(() => groups.filter(Boolean), [groups]);
  const [active, setActive] = useState(tabs[0]?.key || "who");

  useEffect(() => {
    if (!tabs.some((tab) => tab.key === active) && tabs[0]) {
      setActive(tabs[0].key);
    }
  }, [tabs, active]);

  const activeGroup = tabs.find((tab) => tab.key === active) || tabs[0];
  const byKey = Object.fromEntries(groups.map((g) => [g.key, g]));
  const rowToys = [byKey.who, byKey.age].filter(Boolean);
  const rowHome = [byKey.type].filter(Boolean);
  // Budget sits with Decor when Type exists (mall home); otherwise with Toys.
  if (byKey.budget) {
    if (byKey.type || !rowToys.length) rowHome.push(byKey.budget);
    else rowToys.push(byKey.budget);
  }
  const leftover = groups.filter((g) => !["who", "age", "type", "budget"].includes(g.key));
  if (leftover.length) (rowHome.length ? rowHome : rowToys).push(...leftover);

  return (
    <section id={id} className={`${CONTAINER} max-w-full scroll-mt-28 overflow-x-hidden py-1.5 lg:py-2`}>
      <div
        className={cn(
          "relative max-w-full overflow-hidden rounded-[1.25rem] border px-2.5 py-2.5 shadow-soft sm:px-3 sm:py-3",
          shell
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full bg-sun/25 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-brand/15 blur-3xl"
        />

        <div className="relative mb-2.5 flex items-end justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sun shadow-sm ring-2 ring-sun/40">
              <Sparkles size={15} aria-hidden="true" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">{title}</p>
              <p className="font-display text-sm font-semibold text-ink sm:text-base">{subtitle}</p>
            </div>
          </div>
          <Link
            href={seeAllHref}
            className="inline-flex h-9 shrink-0 items-center rounded-full bg-ink px-3 text-[11px] font-bold text-white transition hover:bg-brand"
          >
            Browse all
          </Link>
        </div>

        {/* Mobile: tab pills + wrap chips (no cut-off scroller) */}
        <div className="relative lg:hidden">
          <div
            className={cn(
              "grid gap-1.5",
              tabs.length <= 2 ? "grid-cols-2" : tabs.length === 3 ? "grid-cols-3" : "grid-cols-4"
            )}
          >
            {tabs.map((tab) => {
              const Icon = tab.Icon;
              const on = tab.key === activeGroup?.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActive(tab.key)}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1.5 text-center transition",
                    on
                      ? "border-ink bg-ink text-sun shadow-sm"
                      : "border-line/80 bg-white/90 text-ink-muted"
                  )}
                >
                  <Icon size={14} aria-hidden="true" strokeWidth={2.4} />
                  <span className="font-display text-[11px] font-bold leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeGroup ? (
            <div className="mt-2.5 rounded-2xl border border-white/80 bg-white/70 p-2 shadow-sm">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {activeGroup.label} · pick one
              </p>
              <div className="flex flex-wrap gap-2">
                {activeGroup.items.map((item, index) => (
                  <TiltChip
                    key={item.key}
                    href={item.href}
                    label={item.label}
                    sub={item.sub}
                    image={item.image}
                    color={item.color}
                    emphasis={item.emphasis}
                    ChipIcon={item.ChipIcon}
                    delay={index * 0.03}
                    reduceMotion={reduceMotion}
                    touch
                    wrap
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Desktop: two short rows */}
        <div className="relative hidden gap-2 lg:grid">
          {[
            {
              key: "toys",
              eyebrow: "Toys",
              caption: byKey.budget && !byKey.type ? "Who, age & budget" : "Who & age",
              groups: rowToys,
              tint: "from-[#eef2ff]/80 to-transparent",
            },
            {
              key: "home",
              eyebrow: "Decor",
              caption: byKey.type && byKey.budget ? "Type & budget" : byKey.type ? "Type" : "Budget",
              groups: rowHome,
              tint: "from-[#ecfdf5]/90 to-transparent",
            },
          ]
            .filter((row) => row.groups.length)
            .map((row) => (
              <div
                key={row.key}
                className={cn(
                  "rounded-[1rem] border border-white/70 bg-gradient-to-r p-1.5 shadow-sm ring-1 ring-black/[0.03]",
                  row.tint
                )}
              >
                <div className="mb-1 flex items-center gap-2 px-1">
                  <span className="rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-sun">
                    {row.eyebrow}
                  </span>
                  <span className="text-[10px] font-semibold text-ink-muted">{row.caption}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {row.groups.map((group, groupIndex) => (
                    <GroupStrip
                      key={group.key}
                      group={group}
                      groupIndex={groupIndex}
                      showDivider={groupIndex > 0}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

function GroupStrip({ group, groupIndex, showDivider, reduceMotion, touch = false }) {
  const Icon = group.Icon;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showDivider ? <span className="mx-0.5 hidden h-7 w-px shrink-0 bg-line/80 sm:inline-block" aria-hidden="true" /> : null}
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.05em] shadow-sm ring-1",
          touch ? "h-11" : "h-8",
          group.tone
        )}
      >
        <Icon size={touch ? 13 : 11} aria-hidden="true" strokeWidth={2.5} />
        <span className="leading-none">{group.label}</span>
        <span className="rounded-full bg-white/25 px-1 py-px text-[8px] font-bold normal-case tracking-normal opacity-90">
          {group.hint}
        </span>
      </span>
      {group.items.map((item, index) => (
        <TiltChip
          key={item.key}
          href={item.href}
          label={item.label}
          sub={item.sub}
          image={item.image}
          color={item.color}
          emphasis={item.emphasis}
          ChipIcon={item.ChipIcon}
          delay={(groupIndex * 3 + index) * 0.04}
          reduceMotion={reduceMotion}
          touch={touch}
        />
      ))}
    </div>
  );
}

function TapHandCue({ onDone }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 left-6 z-20 sm:left-10"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      aria-hidden="true"
    >
      <button
        type="button"
        tabIndex={-1}
        className="pointer-events-auto flex flex-col items-center"
        onClick={onDone}
        aria-label="Dismiss tip"
      >
        <motion.div
          animate={{ y: [0, 6, 0], rotate: [-16, -6, -16] }}
          transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <span className="absolute inset-0 scale-125 rounded-full bg-sun/50 blur-md" />
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-lg ring-2 ring-sun">
            <Hand size={16} strokeWidth={2.4} className="-rotate-[18deg]" />
          </span>
        </motion.div>
        <span className="mt-1.5 rounded-full bg-ink px-1.5 py-px text-[9px] font-bold text-sun shadow-sm">
          Tap chips
        </span>
      </button>
    </motion.div>
  );
}

function TiltChip({ href, label, sub, image, color, emphasis, ChipIcon, delay = 0, reduceMotion, touch = false, wrap = false }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-18, 18], [8, -8]), { stiffness: 280, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-18, 18], [-10, 10]), { stiffness: 280, damping: 22 });

  function onMove(event) {
    if (reduceMotion || !ref.current || wrap) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: reduceMotion || wrap ? 0 : rotateX,
        rotateY: reduceMotion || wrap ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24, delay }}
      className={cn(wrap ? "" : "shrink-0")}
    >
      <Link
        href={href}
        className={cn(
          "group relative flex items-center gap-1 rounded-full border px-1.5 pr-2.5 shadow-sm transition",
          touch ? "h-11 min-w-[2.75rem]" : "h-8",
          wrap && "min-h-11",
          "hover:z-10 hover:shadow-soft",
          emphasis === "age" && "border-[#f59e0b]/35 ring-1 ring-[#f59e0b]/20",
          emphasis === "budget" && "border-[#059669]/35 ring-1 ring-[#059669]/20",
          !emphasis && "border-black/5"
        )}
        style={{
          background: `linear-gradient(145deg, ${color || "#fff"} 0%, #ffffff 78%)`,
        }}
      >
        {image ? (
          <span
            className={cn(
              "relative grid place-items-center overflow-hidden rounded-full bg-white/80 ring-1 ring-black/5",
              touch || wrap ? "h-8 w-8" : "h-6 w-6"
            )}
          >
            <ToyImage src={image} alt="" sizes="32px" className="object-contain p-0.5 transition duration-300 group-hover:scale-110" />
          </span>
        ) : ChipIcon ? (
          <span
            className={cn(
              "grid place-items-center rounded-full bg-white/80 text-ink ring-1 ring-black/5",
              touch || wrap ? "h-8 w-8" : "h-6 w-6"
            )}
          >
            <ChipIcon size={touch || wrap ? 14 : 12} aria-hidden="true" />
          </span>
        ) : null}
        <span className="flex flex-col">
          <span
            className={cn(
              "font-display leading-none text-ink",
              emphasis === "budget" ? "text-[11px] font-bold tabular-nums" : "text-[11px] font-semibold",
              emphasis === "age" && "text-[12px] font-bold",
              (touch || wrap) && "text-[12px]"
            )}
          >
            {label}
          </span>
          {sub ? (
            <span
              className={cn(
                "mt-px text-[8px] font-bold uppercase tracking-[0.06em]",
                emphasis === "age" && "text-[#b45309]",
                emphasis === "budget" && "text-[#047857]"
              )}
            >
              {sub}
            </span>
          ) : null}
        </span>
      </Link>
    </motion.div>
  );
}
