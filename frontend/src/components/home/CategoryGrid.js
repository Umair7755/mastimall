import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { CategoryMarquee } from "@/components/home/CategoryMarquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTAINER } from "@/lib/layout";

export function CategoryGrid({ title, department, limit = 10 }) {
  if (!department) return null;
  const categories = department.categories || [];
  const shown = categories.slice(0, limit);
  const heading = /picture/i.test(title || "") ? "Top categories" : title || "Top categories";

  return (
    <section className={`${CONTAINER} py-3 lg:py-5`}>
      <div className="rounded-[1.5rem] bg-gradient-to-br from-[#dff5ff] via-white to-[#ffe8f3] p-3 sm:p-4 lg:p-5">
        <SectionHeading
          title={heading}
          text="Cars, baby toys, dolls, blocks — tap a type and start shopping."
          action={
            <Link
              href={`/${department.slug}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 font-display text-white"
            >
              <LayoutGrid aria-hidden="true" size={16} />
              All toys
            </Link>
          }
        />
        <CategoryMarquee categories={shown} departmentSlug={department.slug} />
      </div>
    </section>
  );
}
