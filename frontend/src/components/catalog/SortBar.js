import Link from "next/link";
import { SORTS, SORT_MORE } from "@/lib/constants";
import { hrefWith, one } from "@/lib/paths";
import { cn } from "@/lib/cn";

function sortChip(selected) {
  return cn(
    "inline-flex min-h-9 items-center rounded-lg border px-3 text-sm transition",
    selected
      ? "border-brand bg-brand text-white"
      : "border-line/80 bg-white text-ink hover:border-brand/40 hover:bg-brand-soft/50"
  );
}

export function SortBar({ pathname, searchParams = {} }) {
  const selected = one(searchParams.sort) || "popular";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {SORTS.map((sort) => (
        <Link
          key={sort.id}
          href={hrefWith(pathname, searchParams, { sort: sort.id === "popular" ? null : sort.id })}
          className={sortChip(selected === sort.id)}
        >
          {sort.label}
        </Link>
      ))}
      <details className="relative">
        <summary className={sortChip(selected === SORT_MORE.id)}>More</summary>
        <div className="absolute right-0 z-20 mt-2 min-w-44 rounded-xl border border-line bg-white p-1.5 shadow-lift">
          <Link
            href={hrefWith(pathname, searchParams, { sort: SORT_MORE.id })}
            className="flex min-h-10 items-center rounded-lg px-3 text-sm hover:bg-brand-soft"
          >
            {SORT_MORE.label}
          </Link>
        </div>
      </details>
    </div>
  );
}
