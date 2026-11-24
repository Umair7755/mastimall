import { cn } from "@/lib/cn";

export function SectionHeading({ title, text, action, eyebrow, compact = false }) {
  const hasEyebrow = Boolean(eyebrow);
  const hasText = Boolean(text);

  return (
    <div className={cn(compact ? "mb-2 sm:mb-3" : "mb-3 sm:mb-5")}>
      {hasEyebrow ? (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">{eyebrow}</p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h2
          className={cn(
            "min-w-0 font-display font-semibold tracking-tight text-ink",
            compact ? "text-lg sm:text-xl lg:text-2xl" : "text-xl sm:text-2xl lg:text-[32px]"
          )}
        >
          {title}
        </h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {hasText ? (
        <p className="mt-0.5 max-w-2xl text-xs text-ink-muted sm:mt-1 sm:text-sm">{text}</p>
      ) : null}
    </div>
  );
}
