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

function TimeCell({ label, value, pulse }) {
  const display = value == null ? "··" : pad(value);
  return (
    <div className="flex flex-col items-center">
      <span
        key={pulse ? display : label}
        className={`sale-banner__tick grid min-w-[2.15rem] place-items-center rounded-lg bg-white/95 px-1.5 py-1 font-display text-sm font-bold tabular-nums text-[#4c1d95] shadow-sm sm:min-w-[2.5rem] sm:text-base ${
          pulse && value != null ? "sale-banner__tick--pulse" : ""
        }`}
      >
        {display}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/75">{label}</span>
    </div>
  );
}

function badgeMark(badge) {
  const match = String(badge || "").match(/(\d+)\.(\d+)/);
  if (match) return match[1];
  return String(badge || "S").slice(0, 2).toUpperCase();
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
    // Fixed calendar deadline — avoid Date.now() during render
    const year = new Date().getFullYear();
    return new Date(year, 10, 18, 23, 59, 59, 999);
  }, [config.endsAt]);

  // Countdown starts after mount so SSR and first client paint match
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

      <div className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 opacity-30 sm:opacity-50">
        <Sparkles className="sale-spin h-16 w-16 text-sun" aria-hidden="true" />
      </div>
      <div className="pointer-events-none absolute -right-4 top-0 opacity-40 sm:opacity-60">
        <Gift className="sale-float h-10 w-10 text-white" aria-hidden="true" />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-16 hidden opacity-50 sm:block">
        <Zap className="sale-float-delay h-8 w-8 text-sun" aria-hidden="true" />
      </div>

      <div className="relative mx-auto flex max-w-[1920px] flex-col items-center justify-between gap-2.5 px-3 py-2.5 sm:flex-row sm:gap-4 sm:px-4 sm:py-3 lg:px-5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="sale-banner__badge inline-flex items-center gap-1.5 rounded-full bg-sun px-2.5 py-1 font-display text-xs font-bold tracking-wide text-ink shadow-[0_3px_0_0_#c9860a] sm:text-sm">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-black text-sun">
              {badgeMark(config.badge || "SALE")}
            </span>
            {config.badge || "SALE"}
          </span>

          <p className="text-center text-sm font-semibold sm:text-left">
            <span className="font-display text-base sm:text-lg">{config.title || "Store deals"}</span>
            {config.subtitle ? (
              <>
                <span className="mx-1.5 hidden text-white/50 sm:inline">·</span>
                <span className="block text-white/90 sm:inline">{config.subtitle}</span>
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
            href={config.ctaHref || "/search?onSale=1"}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 font-display text-sm font-semibold text-[#6d28d9] shadow-soft transition hover:scale-[1.03] hover:bg-sun hover:text-ink active:scale-[0.98]"
          >
            <Gift aria-hidden="true" size={16} />
            {config.ctaLabel || "Shop deals"}
          </Link>
        </div>
      </div>

      {note ? (
        <p className="relative border-t border-white/10 px-3 py-1 text-center text-[11px] text-white/70 sm:px-4">
          {note}
        </p>
      ) : null}
    </div>
  );
}
