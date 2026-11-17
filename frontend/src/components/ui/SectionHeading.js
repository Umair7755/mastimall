export function SectionHeading({ title, text, action, eyebrow }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-5 sm:gap-3">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl lg:text-[32px]">{title}</h2>
        {text ? <p className="mt-0.5 max-w-2xl text-xs text-ink-muted sm:mt-1 sm:text-sm">{text}</p> : null}
      </div>
      {action || null}
    </div>
  );
}
