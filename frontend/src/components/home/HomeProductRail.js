import Link from "next/link";
import { Flame, ShoppingBag, Sparkles, Sofa } from "lucide-react";
import { ProductMarquee } from "@/components/home/ProductMarquee";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTAINER } from "@/lib/layout";

/** Compact one-line carousel card widths for home shelves. */
const COMPACT_ROW =
  "w-[48%] sm:w-[34%] md:w-[26%] lg:w-[18.5%] xl:w-[15%] 2xl:w-[13%]";

const THEMES = {
  mix: {
    title: "Mall picks",
    text: "Toys lead the shelf — décor finishes the room.",
    icon: ShoppingBag,
    moreHref: "/search",
    shell: "bg-gradient-to-br from-[#fff7ec] via-white to-[#ecfdf5] ring-1 ring-black/5 shadow-soft",
    display: "marquee",
  },
  toysAll: {
    title: "All toys",
    text: "Swipe the play shelf.",
    icon: ShoppingBag,
    moreHref: "/toys",
    shell: "bg-gradient-to-br from-[#eef2ff] via-white to-[#fff7ed] ring-1 ring-[#c7d2fe]/70 shadow-soft",
    display: "row",
    compact: true,
  },
  toysFav: {
    title: "Favourite toys",
    text: "What kids keep asking for.",
    icon: Flame,
    moreHref: "/search?department=toys&sort=popular&featured=1",
    shell: "bg-[#fff8ee]",
    display: "row",
    hot: true,
  },
  toysHot: {
    title: "Hot toys",
    text: "What kids keep asking for.",
    icon: Flame,
    moreHref: "/search?department=toys&sort=popular&featured=1",
    shell: "bg-[#fff8ee]",
    display: "row",
    hot: true,
  },
  toysNew: {
    title: "New toys",
    text: "Just arrived on the play shelf.",
    icon: Sparkles,
    moreHref: "/search?department=toys&isNew=1&sort=new",
    shell: "bg-gradient-to-br from-white via-[#fffbeb] to-[#f8fafc] ring-1 ring-line/50 shadow-soft",
    display: "row",
    compact: true,
  },
  decorAll: {
    title: "All décor",
    text: "Swipe home mood pieces.",
    icon: Sofa,
    moreHref: "/decor",
    shell: "bg-gradient-to-br from-[#ecfdf5] via-white to-[#f0fdfa] ring-1 ring-teal-100 shadow-soft",
    display: "row",
    compact: true,
  },
  decorHot: {
    title: "Featured décor",
    text: "Pieces that finish a room fast.",
    icon: Flame,
    moreHref: "/search?department=decor&sort=popular&featured=1",
    shell: "bg-[#f0fdfa]",
    display: "row",
    hot: true,
  },
  decorNew: {
    title: "New décor",
    text: "Just arrived for the home.",
    icon: Sparkles,
    moreHref: "/search?department=decor&isNew=1&sort=new",
    shell: "bg-gradient-to-br from-white via-[#f0fdfa] to-[#ecfeff] ring-1 ring-teal-100/80 shadow-soft",
    display: "row",
    compact: true,
  },
  arrivals: {
    title: "New arrivals",
    text: "Just arrived — toys and décor.",
    icon: Sparkles,
    moreHref: "/search?isNew=1&sort=new",
    shell: "bg-gradient-to-br from-[#fff7ec] via-white to-[#f5f3ff] ring-1 ring-black/5 shadow-soft",
    display: "row",
    compact: true,
  },
};

export function HomeProductRail({
  theme = "mix",
  products = [],
  title,
  text,
  moreHref,
  flush = false,
  marquee,
  layout,
}) {
  if (!products?.length) return null;
  const meta = THEMES[theme] || THEMES.mix;
  const Icon = meta.icon;

  let mode = layout || meta.display || "grid";
  if (marquee === true) mode = "marquee";
  if (marquee === false && mode === "marquee") mode = "row";

  const useCompact = mode === "row" && !!meta.compact;

  return (
    <section className={flush ? "py-0" : `${CONTAINER} py-2.5 lg:py-4`}>
      <div
        className={`relative rounded-[1.5rem] ${meta.shell} p-3 sm:p-4 lg:p-5 ${
          mode === "marquee" ? "overflow-hidden" : "overflow-visible"
        }`}
      >
        {mode === "marquee" ? (
          <>
            <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-sun/25 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />
          </>
        ) : (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-20 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(ellipse_at_top,rgb(255_255_255_/_0.65),transparent_70%)]"
            aria-hidden="true"
          />
        )}
        <div className="relative">
          <SectionHeading
            title={title || meta.title}
            text={text || meta.text}
            action={
              <Link
                href={moreHref || meta.moreHref}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 font-display text-sm text-white transition hover:bg-brand"
              >
                <Icon aria-hidden="true" size={15} />
                See all
              </Link>
            }
          />
          {mode === "marquee" ? (
            <ProductMarquee products={products} />
          ) : (
            <ProductGrid
              products={products}
              layout={mode === "row" ? "row" : "grid"}
              hot={!!meta.hot}
              itemClassName={useCompact ? COMPACT_ROW : undefined}
              dense={useCompact}
            />
          )}
        </div>
      </div>
    </section>
  );
}
