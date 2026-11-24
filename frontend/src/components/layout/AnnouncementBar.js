"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Gift, Sparkles, Zap } from "lucide-react";

function splitTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, done: total <= 0 };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function TimeCell({ label, value, pulse, compact }) {
  const display = value == null ? "··" : pad(value);
  return (
    <div className="flex flex-col items-center">
      <span
        key={pulse ? display : label}
        className={`sale-banner__tick grid place-items-center rounded-md bg-white/95 font-display font-bold tabular-nums text-[#4c1d95] shadow-sm ${
          compact
            ? "min-w-[1.55rem] px-1 py-0.5 text-[11px] leading-none"
            : "min-w-[2.15rem] px-1.5 py-1 text-sm sm:min-w-[2.5rem] sm:text-base"
        } ${pulse && value != null ? "sale-banner__tick--pulse" : ""}`}
      >
        {display}
      </span>
      <span
        className={`font-semibold uppercase tracking-wider text-white/75 ${
          compact ? "mt-0 text-[7px] leading-none" : "mt-0.5 text-[9px]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/** Prefer full “11.11” style marks; fall back to a short badge label. */
function badgeMark(badge, { full = false } = {}) {
  const raw = String(badge || "SALE").trim();
  const decimal = raw.match(/(\d+\.\d+)/);
  if (decimal) return decimal[1];
  if (full) return raw.length > 10 ? raw.slice(0, 10) : raw;
  return raw.slice(0, 2).toUpperCase();
}

/** Top sale banner — content comes from admin settings. */
export function AnnouncementBar({ banner, message }) {
  const config = banner || {};
  const enabled = config.enabled !== false;
  const note = config.message || message || "";

  const deadline = useMemo(() => {
    if (config.endsAt) {
      const date = new Date(config.endsAt);
      if (!Number.isNaN(date.getTime())) return date;
    }
    const year = new Date().getFullYear();
    return new Date(year, 10, 18, 23, 59, 59, 999);
  }, [config.endsAt]);

  const [parts, setParts] = useState(null);

  useEffect(() => {
    const tick = () => setParts(splitTime(deadline.getTime() - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (!enabled) return null;

  const showEnded = parts?.done;
  const live = parts && !parts.done;

  return (
    <div className="sale-banner relative overflow-hidden text-white">
      <div className="sale-banner__shimmer pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="pointer-events-none absolute -left-6 top-1/2 hidden -translate-y-1/2 opacity-50 sm:block">
        <Sparkles className="sale-spin h-16 w-16 text-sun" aria-hidden="true" />
      </div>
      <div className="pointer-events-none absolute -right-4 top-0 hidden opacity-60 sm:block">
        <Gift className="sale-float h-10 w-10 text-white" aria-hidden="true" />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-16 hidden opacity-50 sm:block">
        <Zap className="sale-float-delay h-8 w-8 text-sun" aria-hidden="true" />
      </div>

      {/* Mobile: badge + sliding title · subtitle + timer */}
      <div className="relative mx-auto flex max-w-[1920px] items-center gap-1.5 px-2 py-1.5 sm:hidden">
        <Link
          href={config.ctaHref || "/sales"}
          className="sale-banner__badge inline-flex h-6 shrink-0 items-center rounded-full bg-sun px-2 font-display text-[11px] font-black tabular-nums tracking-tight text-ink shadow-[0_2px_0_0_#c9860a]"
          title={config.badge || "SALE"}
          aria-label="Open sales"
        >
          {badgeMark(config.badge || "SALE", { full: true })}
        </Link>

        <div
          className="sale-banner__marquee min-w-0 flex-1"
          aria-label={[config.title || "Store deals", config.subtitle].filter(Boolean).join(". ")}
        >
          <div className="sale-banner__marquee-track">
            {[0, 1].map((copy) => (
              <span
                key={copy}
                className="sale-banner__marquee-item inline-flex items-baseline gap-1.5 font-display text-[12px] font-semibold leading-none"
                aria-hidden={copy === 1 ? "true" : undefined}
              >
                <span>{config.title || "Store deals"}</span>
                {config.subtitle ? (
                  <>
                    <span className="text-white/45" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-sans text-[11px] font-medium text-white/85">{config.subtitle}</span>
                  </>
                ) : null}
              </span>
            ))}
          </div>
        </div>

        {showEnded ? (
          <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">Ended</span>
        ) : (
          <div className="flex shrink-0 items-end gap-0.5" aria-live="polite" aria-label="Sale countdown">
            <TimeCell label="D" value={live ? parts.days : null} compact />
            <span className="mb-2.5 font-display text-[10px] text-white/55">:</span>
            <TimeCell label="H" value={live ? parts.hours : null} compact />
            <span className="mb-2.5 font-display text-[10px] text-white/55">:</span>
            <TimeCell label="M" value={live ? parts.minutes : null} compact />
            <span className="mb-2.5 font-display text-[10px] text-white/55">:</span>
            <TimeCell label="S" value={live ? parts.seconds : null} pulse={live} compact />
          </div>
        )}
      </div>

      {/* Desktop / tablet */}
      <div className="relative mx-auto hidden max-w-[1920px] flex-col items-center justify-between gap-2.5 px-3 py-2.5 sm:flex sm:flex-row sm:gap-4 sm:px-4 sm:py-3 lg:px-5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Link
            href={config.ctaHref || "/sales"}
            className="sale-banner__badge inline-flex items-center gap-1.5 rounded-full bg-sun px-2.5 py-1 font-display text-xs font-bold tracking-wide text-ink shadow-[0_3px_0_0_#c9860a] transition hover:brightness-105 sm:text-sm"
            aria-label="Open sales"
          >
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-[11px] font-black tabular-nums text-sun">
              {badgeMark(config.badge || "SALE", { full: true })}
            </span>
            {config.badge || "SALE"}
          </Link>

          <p className="text-center text-sm font-semibold sm:text-left">
            <span className="font-display text-base sm:text-lg">{config.title || "Store deals"}</span>
            {config.subtitle ? (
              <>
                <span className="mx-1.5 text-white/50">·</span>
                <span className="text-white/90">{config.subtitle}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {showEnded ? (
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              Sale ended — still check deals
            </span>
          ) : (
            <div className="flex items-end gap-1.5" aria-live="polite" aria-label="Sale countdown">
              <span className="mb-4 hidden text-[10px] font-semibold uppercase tracking-wider text-white/70 sm:inline">
                Ends in
              </span>
              <TimeCell label="Days" value={live ? parts.days : null} />
              <span className="mb-4 font-display text-lg text-white/60">:</span>
              <TimeCell label="Hrs" value={live ? parts.hours : null} />
              <span className="mb-4 font-display text-lg text-white/60">:</span>
              <TimeCell label="Min" value={live ? parts.minutes : null} />
              <span className="mb-4 font-display text-lg text-white/60">:</span>
              <TimeCell label="Sec" value={live ? parts.seconds : null} pulse={live} />
            </div>
          )}

          <Link
            href={config.ctaHref || "/sales"}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 font-display text-sm font-semibold text-[#6d28d9] shadow-soft transition hover:scale-[1.03] hover:bg-sun hover:text-ink active:scale-[0.98]"
          >
            <Gift aria-hidden="true" size={16} />
            {config.ctaLabel || "Shop deals"}
          </Link>
        </div>
      </div>

      {note ? (
        <p className="relative hidden border-t border-white/10 px-3 py-1 text-center text-[11px] text-white/70 sm:block sm:px-4">
          {note}
        </p>
      ) : null}
    </div>
  );
}
