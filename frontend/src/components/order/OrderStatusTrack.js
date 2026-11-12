import { Check, Package, PackageCheck, PartyPopper, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export const ORDER_STEPS = [
  { id: "new", label: "Placed", hint: "We got your order", Icon: PartyPopper },
  { id: "confirmed", label: "Confirmed", hint: "Team checked it", Icon: Check },
  { id: "packed", label: "Packed", hint: "Toys boxed carefully", Icon: Package },
  { id: "shipped", label: "Shipped", hint: "On the way", Icon: Truck },
  { id: "delivered", label: "Delivered", hint: "Happy unboxing", Icon: PackageCheck },
];

function stepIndex(status) {
  return ORDER_STEPS.findIndex((step) => step.id === status);
}

export function OrderStatusTrack({ status, preview = false, compact = false }) {
  if (!preview && (status === "cancelled" || status === "returned")) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-100 text-rose-600">
            <XCircle size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-rose-700">
              {status === "cancelled" ? "Order cancelled" : "Order returned"}
            </p>
            <p className="text-xs text-rose-600/80">This order is no longer in delivery.</p>
          </div>
        </div>
      </div>
    );
  }

  const current = preview ? -1 : Math.max(0, stepIndex(status));
  const delivered = !preview && status === "delivered";
  const progress =
    preview || current <= 0 ? 0 : delivered ? 100 : (current / (ORDER_STEPS.length - 1)) * 100;

  return (
    <div
      className={cn(
        "rounded-2xl border border-line/70 bg-gradient-to-b from-white to-[#f7f4ee]",
        compact ? "px-3 py-2.5" : "p-4 sm:p-5"
      )}
    >
      <div className={cn("flex items-center justify-between gap-3", compact ? "mb-2.5" : "mb-4")}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Order progress</p>
          <p className={cn("font-display font-semibold text-ink", compact ? "text-base" : "mt-1 text-lg")}>
            {preview ? "How tracking works" : ORDER_STEPS[current]?.label || "In progress"}
          </p>
        </div>
        {!preview ? (
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-bold text-brand">
            {Math.min(current + 1, ORDER_STEPS.length)}/{ORDER_STEPS.length}
          </span>
        ) : null}
      </div>

      <ol className="relative grid grid-cols-5 gap-1">
        <span
          className={cn(
            "pointer-events-none absolute left-[10%] right-[10%] rounded-full bg-line/70",
            compact ? "top-4 h-1" : "top-5 h-1.5"
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "pointer-events-none absolute left-[10%] rounded-full bg-gradient-to-r from-emerald-500 to-brand transition-all duration-500",
            compact ? "top-4 h-1" : "top-5 h-1.5"
          )}
          style={{ width: `${progress * 0.8}%` }}
          aria-hidden="true"
        />

        {ORDER_STEPS.map((step, index) => {
          const done = !preview && (index < current || delivered);
          const active = !preview && index === current && !delivered;
          const upcoming = !done && !active;
          const Icon = step.Icon;
          return (
            <li key={step.id} className="relative z-10 flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative grid place-items-center rounded-full border-2 shadow-sm transition",
                  compact ? "h-8 w-8" : "h-10 w-10 sm:h-11 sm:w-11",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  active &&
                    "order-step-pulse border-sun bg-sun text-ink shadow-[0_2px_0_0_#c9860a] ring-2 ring-sun/25",
                  upcoming && "border-dashed border-line bg-[#f3efe6] text-ink-muted opacity-70"
                )}
              >
                {done ? (
                  <Check size={compact ? 13 : 16} strokeWidth={2.6} aria-hidden="true" />
                ) : (
                  <Icon size={compact ? 13 : 16} strokeWidth={2.35} aria-hidden="true" />
                )}
              </span>
              <p
                className={cn(
                  "mt-1.5 font-bold leading-tight",
                  compact ? "text-[10px]" : "text-[11px] sm:text-xs",
                  done && "text-emerald-700",
                  active && "text-ink",
                  upcoming && "text-ink-muted"
                )}
              >
                {step.label}
              </p>
              {!compact ? (
                <p
                  className={cn(
                    "mt-0.5 hidden text-[10px] sm:block",
                    done && "font-medium text-emerald-600/80",
                    active && "font-semibold text-ink-muted",
                    upcoming && "text-ink-muted/70"
                  )}
                >
                  {done ? "Done" : active ? step.hint : "Waiting"}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
