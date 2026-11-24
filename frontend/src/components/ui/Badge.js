import { cn } from "@/lib/cn";

const tones = {
  new: "bg-brand text-white",
  sale: "bg-coral text-white",
  sun: "bg-sun text-ink",
  success: "bg-emerald-500 text-white",
  danger: "bg-danger text-white",
  neutral: "bg-ink text-white",
};

/** Compact corner flags — not fat pills. */
export function Badge({ tone = "new", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 font-display text-[11px] font-semibold uppercase tracking-wide shadow-soft",
        tones[tone] || tones.new,
        className
      )}
    >
      {children}
    </span>
  );
}

/** Bold sale flag with optional % off. */
export function SaleBadge({ percent, compact = false, className }) {
  const label =
    Number.isFinite(percent) && percent > 0 && percent < 100
      ? `${Math.round(percent)}% OFF`
      : "SALE";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#e11d48] to-[#fb7185] font-display font-black uppercase tracking-wide text-white shadow-[0_6px_14px_-8px_rgba(225,29,72,0.8)] ring-2 ring-white/90",
        compact ? "h-6 px-2 text-[10px]" : "h-7 px-2.5 text-[11px]",
        className
      )}
    >
      <span className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[9px] leading-none">
        %
      </span>
      {label}
    </span>
  );
}

/** Price ribbon used on budget tiles and hot product cards. */
export function PriceRibbon({ label = "UNDER", value, color = "#2563EB", className }) {
  return (
    <span
      className={cn(
        "relative inline-flex min-w-[78px] flex-col items-start rounded-t-lg rounded-br-lg px-2.5 pb-2 pt-1.5 text-white shadow-soft",
        className
      )}
      style={{ backgroundColor: color }}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">{label}</span>
      <span className="font-display text-lg font-bold leading-none tracking-tight">{value}</span>
      <span
        aria-hidden="true"
        className="absolute -bottom-1.5 left-0 h-0 w-0 border-l-[10px] border-t-[8px] border-l-transparent"
        style={{ borderTopColor: color, filter: "brightness(0.72)" }}
      />
    </span>
  );
}
