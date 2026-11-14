import { Sparkles } from "lucide-react";
import { formatPkr } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PriceTag({ price, salePrice, currentPrice, className = "", compact = false }) {
  const list = Number(price) || 0;
  const sale = Number(salePrice) || 0;
  const onSale = sale > 0 && sale < list;
  const pay = onSale ? sale : Number(currentPrice ?? price) || list;
  const saved = onSale ? list - sale : 0;
  const pct = onSale && list > 0 ? Math.round((saved / list) * 100) : 0;

  return (
    <div className={cn("flex flex-col", compact ? "gap-0.5 sm:gap-1" : "gap-1 sm:gap-1.5", className)}>
      <p className="flex flex-wrap items-baseline gap-1.5">
        <span
          className={cn(
            "font-display font-bold tracking-tight text-ink",
            /* Mobile smaller; desktop keeps the original weight */
            compact ? "text-[13px] sm:text-base lg:text-[17px]" : "text-base sm:text-xl lg:text-[22px]"
          )}
        >
          {formatPkr(pay)}
        </span>
        {onSale ? (
          <span
            className={cn(
              "text-ink-muted line-through",
              compact ? "text-[10px] sm:text-[11px] lg:text-sm" : "text-xs sm:text-sm"
            )}
          >
            {formatPkr(list)}
          </span>
        ) : null}
      </p>

      {onSale ? (
        <span
          className={cn(
            "inline-flex w-fit max-w-full items-center rounded-full bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399] font-bold uppercase tracking-wide text-white ring-1 ring-emerald-200/80",
            compact
              ? "gap-0.5 px-1.5 py-0.5 text-[8px] sm:gap-1 sm:px-2 sm:py-0.5 sm:text-[10px] lg:text-[11px]"
              : "gap-1 px-2 py-0.5 text-[9px] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]"
          )}
        >
          <Sparkles
            size={compact ? 8 : 10}
            aria-hidden="true"
            className="shrink-0 text-[#ecfdf5] sm:hidden"
          />
          <Sparkles
            size={compact ? 10 : 12}
            aria-hidden="true"
            className="hidden shrink-0 text-[#ecfdf5] sm:inline"
          />
          <span className="truncate">Save {formatPkr(saved)}</span>
          <span
            className={cn(
              "rounded-full bg-white/20 font-extrabold normal-case tracking-normal",
              compact ? "px-1 py-px text-[8px] sm:px-1.5 sm:text-[10px]" : "px-1.5 py-px text-[9px] sm:text-[10px]"
            )}
          >
            −{pct}%
          </span>
        </span>
      ) : null}
    </div>
  );
}
