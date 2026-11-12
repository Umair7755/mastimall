import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToyImage } from "@/components/product/ToyImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AUDIENCES } from "@/lib/constants";
import { CONTAINER } from "@/lib/layout";

export function AudienceTiles({ title = "Who is it for?" }) {
  return (
    <section id="who" className={`${CONTAINER} scroll-mt-28 py-3 lg:py-5`}>
      <SectionHeading title={title} text="Start with baby, boys or girls." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {AUDIENCES.map((item) => (
          <Link
            key={item.slug}
            href={`/for/${item.slug}`}
            className="group relative overflow-hidden rounded-[1.75rem] p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-lift sm:p-5"
            style={{ background: `linear-gradient(165deg, ${item.color}, #ffffff 70%)` }}
          >
            <div className="flex items-center gap-4">
              <span className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white shadow-soft sm:h-32 sm:w-32">
                <ToyImage src={item.image} alt="" sizes="128px" className="object-contain p-3 transition group-hover:scale-110" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-3xl font-semibold">{item.label}</span>
                <span className="mt-1 block text-ink-muted">{item.caption}</span>
                <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 font-display text-sm text-white">
                  Shop {item.label.toLowerCase()}
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
