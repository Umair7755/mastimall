import Link from "next/link";
import { Flame, ShoppingBag, Sparkles, Sofa } from "lucide-react";
import { ProductMarquee } from "@/components/home/ProductMarquee";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LazyMount } from "@/components/ui/LazyMount";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Compact row card widths (desktop / tablet carousels). */
const COMPACT_ROW =
  "w-[58%] sm:w-[34%] md:w-[26%] lg:w-[18.5%] xl:w-[15%] 2xl:w-[13%]";

const THEMES = {
  mix: {
    title: "Featured",
    text: "",
    eyebrow: "",
    icon: ShoppingBag,
    moreHref: "/search",
    shell: "border border-black/5 bg-gradient-to-br from-[#fff7ec] via-white to-[#ecfdf5] shadow-soft",
    display: "marquee",
    compactHeading: true,
  },
  toysAll: {
    title: "All toys",
    text: "Every toy on the shelf.",
    eyebrow: "Full shelf",
    icon: ShoppingBag,
    moreHref: "/toys",
    shell: "border border-[#c7d2fe]/80 bg-gradient-to-br from-[#eef2ff] via-white to-[#fff7ed] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
    compact: true,
  },
  toysFav: {
    title: "Favourite toys",
    text: "What kids keep asking for.",
    eyebrow: "Popular",
    icon: Flame,
    moreHref: "/search?department=toys&sort=popular&featured=1",
    shell: "border border-[#fed7aa]/70 bg-[#fff8ee] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
    hot: true,
  },
  toysHot: {
    title: "Hot toys",
    text: "What kids keep asking for.",
    eyebrow: "Trending",
    icon: Flame,
    moreHref: "/search?department=toys&sort=popular&featured=1",
    shell: "border border-[#fed7aa]/70 bg-[#fff8ee] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
    hot: true,
  },
  toysNew: {
    title: "New toys",
    text: "Just arrived on the play shelf.",
    eyebrow: "Just in",
    icon: Sparkles,
    moreHref: "/search?department=toys&isNew=1&sort=new",
    shell: "border border-[#fde68a]/90 bg-gradient-to-br from-[#fffbeb] via-white to-[#f8fafc] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
    compact: true,
  },
  decorAll: {
    title: "All décor",
    text: "Every décor piece on the shelf.",
    eyebrow: "Full shelf",
    icon: Sofa,
    moreHref: "/decor",
    shell: "border border-teal-100 bg-gradient-to-br from-[#ecfdf5] via-white to-[#f0fdfa] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
    compact: true,
  },
  decorHot: {
    title: "Featured décor",
    text: "Pieces that finish a room fast.",
    eyebrow: "Popular",
    icon: Flame,
    moreHref: "/search?department=decor&sort=popular&featured=1",
    shell: "border border-teal-100 bg-[#f0fdfa] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
    hot: true,
  },
  decorNew: {
    title: "New décor",
    text: "Just arrived for the home.",
    eyebrow: "Just in",
    icon: Sparkles,
    moreHref: "/search?department=decor&isNew=1&sort=new",
    shell: "border border-teal-100/90 bg-gradient-to-br from-[#f0fdfa] via-white to-[#ecfeff] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
    compact: true,
  },
  arrivals: {
    title: "New arrivals",
    text: "Just arrived — toys and décor.",
    eyebrow: "Just in",
    icon: Sparkles,
    moreHref: "/search?isNew=1&sort=new",
    shell: "border border-black/5 bg-gradient-to-br from-[#fff7ec] via-white to-[#f5f3ff] shadow-soft",
    display: "row",
    mobileDisplay: "grid",
    mobileLimit: 6,
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
  eyebrow,
}) {
  if (!products?.length) return null;
  const meta = THEMES[theme] || THEMES.mix;
  const Icon = meta.icon;

  let mode = layout || meta.display || "grid";
  if (marquee === true) mode = "marquee";
  if (marquee === false && mode === "marquee") mode = "row";

  const useCompact = mode === "row" && !!meta.compact;
  const mobileGrid = mode !== "marquee" && meta.mobileDisplay === "grid";
  const mobileItems =
    mobileGrid && meta.mobileLimit ? products.slice(0, meta.mobileLimit) : products;

  return (
    <section
      className={
        flush
          ? "py-0"
          : "mx-auto w-full max-w-[1920px] px-2 py-2.5 sm:px-3 sm:py-3 lg:px-4 lg:py-4 xl:px-5"
      }
    >
      <div
        className={`relative overflow-hidden rounded-2xl px-0 py-3 sm:rounded-[1.5rem] sm:p-4 lg:p-5 ${meta.shell}`}
      >
        {mode === "marquee" ? (
          <>
            <div
              className="pointer-events-none absolute -left-10 top-0 hidden h-28 w-28 rounded-full bg-sun/25 blur-3xl lg:block"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-8 bottom-0 hidden h-32 w-32 rounded-full bg-brand/15 blur-3xl lg:block"
              aria-hidden="true"
            />
          </>
        ) : (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-16 overflow-hidden rounded-[inherit] bg-[radial-gradient(ellipse_at_top,rgb(255_255_255_/_0.7),transparent_70%)]"
            aria-hidden="true"
          />
        )}
        <div className="relative">
          <div className="px-3 sm:px-0">
            <SectionHeading
              eyebrow={eyebrow ?? meta.eyebrow}
              title={title || meta.title}
              text={text ?? meta.text}
              compact={!!meta.compactHeading}
              action={
                mode === "marquee" ? (
                  <Link
                    href={moreHref || meta.moreHref}
                    className="hidden min-h-10 items-center gap-2 rounded-full bg-ink px-4 font-display text-sm text-white transition hover:bg-brand lg:inline-flex"
                  >
                    <Icon aria-hidden="true" size={15} />
                    See all
                  </Link>
                ) : (
                  <Link
                    href={moreHref || meta.moreHref}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 font-display text-sm text-white transition hover:bg-brand"
                  >
                    <Icon aria-hidden="true" size={15} />
                    See all
                  </Link>
                )
              }
            />
          </div>

          <LazyMount minHeight={mode === "marquee" ? 420 : 220} rootMargin="280px 0px">
            {mode === "marquee" ? (
              <ProductMarquee products={products} />
            ) : mobileGrid ? (
              <>
                <div className="px-3 lg:hidden">
                  <ProductGrid products={mobileItems} layout="grid" hot={!!meta.hot} />
                  {products.length > mobileItems.length ? (
                    <Link
                      href={moreHref || meta.moreHref}
                      className="mt-3 flex min-h-11 items-center justify-center rounded-xl border border-ink/10 bg-white text-sm font-semibold text-ink shadow-sm"
                    >
                      See all {products.length}+
                    </Link>
                  ) : null}
                </div>
                <div className="hidden lg:block">
                  <ProductGrid
                    products={products}
                    layout="row"
                    hot={!!meta.hot}
                    itemClassName={useCompact ? COMPACT_ROW : undefined}
                    dense={useCompact}
                  />
                </div>
              </>
            ) : (
              <div className={mode === "row" ? "sm:px-0" : "px-3 sm:px-0"}>
                <ProductGrid
                  products={products}
                  layout={mode === "row" ? "row" : "grid"}
                  hot={!!meta.hot}
                  itemClassName={useCompact ? COMPACT_ROW : undefined}
                  dense={useCompact}
                />
              </div>
            )}
          </LazyMount>
        </div>
      </div>
    </section>
  );
}
