export function SectionHeading({ title, text, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight lg:text-[32px]">{title}</h2>
        {text ? <p className="mt-1 max-w-2xl text-ink-muted">{text}</p> : null}
      </div>
      {action || null}
    </div>
  );
}
