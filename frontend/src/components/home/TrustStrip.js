import { BadgeCheck, Package, Truck, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTAINER } from "@/lib/layout";

const ICONS = [Truck, BadgeCheck, Package, UserRound];

export function TrustStrip({ title, points = [] }) {
  if (!points.length) return null;
  return (
    <section className={`${CONTAINER} py-3 lg:py-5`}>
      <SectionHeading title={title} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <article key={point.title} className="rounded-[1.5rem] bg-white p-5 shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white">
                <Icon aria-hidden="true" size={20} />
              </span>
              <h3 className="mt-3 font-display text-xl">{point.title}</h3>
              <p className="mt-2 text-ink-muted">{point.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
