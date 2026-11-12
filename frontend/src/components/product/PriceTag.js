import { Sparkles } from "lucide-react";
import { formatPkr } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PriceTag({ price, salePrice, currentPrice, className = "" }) {
  const list = Number(price) || 0;
  const sale = Number(salePrice) || 0;
  const onSale = sale > 0 && sale < list;
  const pay = onSale ? sale : Number(currentPrice ?? price) || list;
  const saved = onSale ? list - sale : 0;
  const pct = onSale && list > 0 ? Math.round((saved / list) * 100) : 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="font-display text-xl font-bold tracking-tight text-ink lg:text-[22px]">
          {formatPkr(pay)}
        </span>
        {onSale ? <span className="text-sm text-ink-muted line-through">{formatPkr(list)}</span> : null}
      </p>

      {onSale ? (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_-8px_rgba(5,150,105,0.85)] ring-1 ring-emerald-200/80">
          <Sparkles size={12} aria-hidden="true" className="shrink-0 text-[#ecfdf5]" />
          You save {formatPkr(saved)}
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold normal-case tracking-normal">
            −{pct}%
          </span>
        </span>
      ) : null}
    </div>
  );
}
