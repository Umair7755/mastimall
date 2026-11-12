"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPkr } from "@/lib/format";
import { hrefWith, one } from "@/lib/paths";

const STEP = 50;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value, step = STEP) {
  return Math.round(value / step) * step;
}

export function PriceRangeSlider({
  pathname,
  searchParams = {},
  minBound = 0,
  maxBound = 10000,
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const floor = Math.max(0, Number.isFinite(Number(minBound)) ? Number(minBound) : 0);
  const ceiling = Math.max(floor + STEP, Number.isFinite(Number(maxBound)) ? Number(maxBound) : 10000);

  const urlMin = one(searchParams.minPrice);
  const urlMax = one(searchParams.maxPrice);

  const initialMin = urlMin ? clamp(Number(urlMin), floor, ceiling) : floor;
  const initialMax = urlMax ? clamp(Number(urlMax), floor, ceiling) : ceiling;

  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(initialMax);
  const [activeThumb, setActiveThumb] = useState("max");

  useEffect(() => {
    setMinValue(urlMin ? clamp(Number(urlMin), floor, ceiling) : floor);
    setMaxValue(urlMax ? clamp(Number(urlMax), floor, ceiling) : ceiling);
  }, [urlMin, urlMax, floor, ceiling]);

  const lo = Math.min(minValue, maxValue);
  const hi = Math.max(minValue, maxValue);
  const span = Math.max(1, ceiling - floor);
  const left = ((lo - floor) / span) * 100;
  const right = ((hi - floor) / span) * 100;

  const presets = useMemo(() => {
    const mid = roundToStep((floor + ceiling) / 2);
    const low = roundToStep(floor + (ceiling - floor) * 0.35);
    return [
      { label: "Any", min: null, max: null },
      { label: `Under ${formatPkr(low)}`, min: null, max: low },
      { label: `${formatPkr(mid)}+`, min: mid, max: null },
    ];
  }, [floor, ceiling]);

  function apply(nextMin, nextMax) {
    const nextLo = Math.min(nextMin, nextMax);
    const nextHi = Math.max(nextMin, nextMax);
    startTransition(() => {
      router.push(
        hrefWith(pathname, searchParams, {
          minPrice: nextLo <= floor ? null : nextLo,
          maxPrice: nextHi >= ceiling ? null : nextHi,
        })
      );
    });
  }

  function commit() {
    apply(minValue, maxValue);
  }

  return (
    <div className={pending ? "opacity-70" : undefined}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-ink">{formatPkr(lo)}</span>
        <span className="text-ink-muted">to</span>
        <span className="font-semibold text-ink">
          {hi >= ceiling ? `${formatPkr(ceiling)}+` : formatPkr(hi)}
        </span>
      </div>

      <div className="relative mt-5 h-8">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#ebe7df]" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }}
        />
        <input
          aria-label="Minimum price"
          type="range"
          min={floor}
          max={ceiling}
          step={STEP}
          value={lo}
          onPointerDown={() => setActiveThumb("min")}
          onChange={(event) => {
            const value = clamp(Number(event.target.value), floor, hi - STEP);
            setMinValue(value);
          }}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          className="price-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
          style={{ zIndex: activeThumb === "min" ? 40 : 20 }}
        />
        <input
          aria-label="Maximum price"
          type="range"
          min={floor}
          max={ceiling}
          step={STEP}
          value={hi}
          onPointerDown={() => setActiveThumb("max")}
          onChange={(event) => {
            const value = clamp(Number(event.target.value), lo + STEP, ceiling);
            setMaxValue(value);
          }}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          className="price-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
          style={{ zIndex: activeThumb === "max" ? 40 : 30 }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const active =
            (preset.min == null ? !urlMin : urlMin === String(preset.min)) &&
            (preset.max == null ? !urlMax : urlMax === String(preset.max));
          return (
            <Linkish
              key={preset.label}
              active={active}
              onClick={() =>
                startTransition(() => {
                  router.push(
                    hrefWith(pathname, searchParams, {
                      minPrice: preset.min,
                      maxPrice: preset.max,
                    })
                  );
                })
              }
            >
              {preset.label}
            </Linkish>
          );
        })}
      </div>
    </div>
  );
}

function Linkish({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs transition ${
        active ? "bg-brand-soft font-semibold text-brand" : "text-ink-muted hover:bg-[#f3efe6] hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
