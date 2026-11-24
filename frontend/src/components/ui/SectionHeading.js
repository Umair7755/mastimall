export function SectionHeading({ title, text, action, eyebrow }) {
  return (
    <div className="mb-3 sm:mb-5">
      {eyebrow ? (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">{eyebrow}</p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 font-display text-xl font-semibold tracking-tight sm:text-2xl lg:text-[32px]">
          {title}
        </h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {text ? <p className="mt-0.5 max-w-2xl text-xs text-ink-muted sm:mt-1 sm:text-sm">{text}</p> : null}
    </div>
  );
}
