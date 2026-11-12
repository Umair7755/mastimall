import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTAINER } from "@/lib/layout";

export function ReviewStrip({ title, items = [] }) {
  if (!items.length) return null;
  return (
    <section className={`${CONTAINER} py-4 lg:py-6`}>
      <SectionHeading title={title} />
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article key={`${item.name}-${item.text}`} className="rounded-[1.5rem] bg-white p-5 shadow-soft">
            <p className="text-ink-muted">“{item.text}”</p>
            <p className="mt-3 font-display text-lg">{item.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
