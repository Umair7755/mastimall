"use client";

import { Minus, Plus } from "lucide-react";

export function QtyStepper({ qty, onChange, min = 1, max = 20 }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-surface disabled:opacity-40"
        onClick={() => onChange(Math.max(min, qty - 1))}
        disabled={qty <= min}
        aria-label="Fewer"
      >
        <Minus aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center font-display text-xl" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-surface disabled:opacity-40"
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        aria-label="More"
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}
