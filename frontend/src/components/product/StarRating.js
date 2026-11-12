"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

function StarSlot({ fill = 0, size = 16 }) {
  const amount = Math.max(0, Math.min(1, fill));
  return (
    <span className="relative inline-block shrink-0 overflow-hidden" style={{ width: size, height: size }}>
      <Star
        size={size}
        aria-hidden="true"
        className="absolute left-0 top-0 fill-transparent text-[#d6d3d1]"
        strokeWidth={1.75}
      />
      {amount > 0 ? (
        <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${amount * 100}%` }}>
          <Star
            size={size}
            aria-hidden="true"
            className="absolute left-0 top-0 max-w-none fill-sun text-sun"
            strokeWidth={1.75}
            style={{ width: size, height: size }}
          />
        </span>
      ) : null}
    </span>
  );
}

/** Read-only stars driven by the real average (supports halves like 4.5). */
export function StarRating({ value = 0, count = 0, size = 16, className, showCount = true }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="inline-flex items-center gap-0.5"
        aria-label={`${rating.toFixed(1)} out of 5 stars`}
        title={`${rating.toFixed(1)} / 5`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <StarSlot key={index} size={size} fill={rating - index} />
        ))}
      </span>
      {showCount ? (
        <span className="text-xs text-ink-muted">
          {rating > 0 ? (
            <>
              <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
              {count > 0 ? <span> · {count}</span> : null}
            </>
          ) : (
            "New"
          )}
        </span>
      ) : null}
    </div>
  );
}

/** Interactive star picker for writing a review (whole stars only). */
export function StarPicker({ value = 0, onChange, size = 28 }) {
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }, (_, index) => {
        const score = index + 1;
        const active = score <= value;
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} star${score > 1 ? "s" : ""}`}
            onClick={() => onChange?.(score)}
            className="rounded-md p-0.5 transition hover:scale-110"
          >
            <Star
              size={size}
              aria-hidden="true"
              className={active ? "fill-sun text-sun" : "fill-transparent text-[#d6d3d1]"}
              strokeWidth={1.75}
            />
          </button>
        );
      })}
    </div>
  );
}
