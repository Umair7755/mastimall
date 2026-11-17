import Link from "next/link";
import { Flame, ShoppingBag, Sparkles } from "lucide-react";
import { getProducts } from "@/lib/data";
import { ProductMarquee } from "@/components/home/ProductMarquee";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
function stripMeta(section) {
  const config = section.config || {};
  if (config.all || config.catalog) {
    return {
      title: section.title || "All toys",
      text: "The full shelf — drifts for you, pause anytime.",
      icon: ShoppingBag,
      moreHref: "/search",
      hot: false,
      shell: "bg-gradient-to-br from-[#e8f4ff] via-white to-[#ffe8f3]",
      marquee: true,
    };
  }
  if (config.featured || /best|hot|popular/i.test(section.title || "")) {
    return {
      title: "Hot right now",
      text: "Toys kids keep picking — ready to add.",
      icon: Flame,
      moreHref: "/search?sort=popular&featured=1",
      hot: true,
      shell: "bg-[#fff8ee]",
    };
  }
  if (config.isNew || /new/i.test(section.title || "")) {
    return {
      title: "New arrivals",
      text: "Fresh toys just added to the shop.",
      icon: Sparkles,
      moreHref: "/search?sort=new",
      hot: false,
      shell: "bg-white",
    };
  }
  return {
    title: section.title || "Toys",
    text: "",
    icon: Sparkles,
    moreHref: "/search",
    hot: false,
    shell: "bg-white",
  };
}

export async function ProductStrip({ section }) {
  const config = section.config || {};
  const params = new URLSearchParams();
  params.set("limit", String(config.limit || 12));
  const isAll = Boolean(config.all || config.catalog);
  const isNewStrip = !isAll && (Boolean(config.isNew) || /new/i.test(section.title || ""));
  // Home "New arrivals" / all-catalog show by date; hot keeps featured filter.
  params.set("sort", isAll || isNewStrip ? config.sort || "new" : config.sort || "popular");
  if (!isAll && config.featured && !isNewStrip) params.set("featured", "1");
  if (!isAll && config.department) params.set("department", config.department);
  if (config.onSale) params.set("onSale", "1");

  let items = [];
  try {
    const result = await getProducts(params.toString());
    items = result?.items || [];
  } catch {
    items = [];
  }
  if (!items.length) return null;

  const meta = stripMeta(section);
  const Icon = meta.icon;

  return (
    <section className="w-full py-2 lg:py-4 sm:mx-auto sm:max-w-[1920px] sm:px-3 lg:px-4 xl:px-5">
      <div
        className={`relative overflow-hidden rounded-none sm:rounded-[1.5rem] ${meta.shell} px-0 py-3 sm:p-4 lg:p-5 ${
          meta.marquee ? "ring-0 sm:ring-1 sm:ring-black/5 shadow-none sm:shadow-soft" : ""
        }`}
      >
        {meta.marquee ? (
          <>
            <div
              className="pointer-events-none absolute -left-10 top-0 hidden h-28 w-28 rounded-full bg-sun/30 blur-3xl sm:block"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-8 bottom-0 hidden h-32 w-32 rounded-full bg-brand/20 blur-3xl sm:block"
              aria-hidden="true"
            />
          </>
        ) : null}
        <div className="relative">
          <div className="px-3 sm:px-0">
            <SectionHeading
              title={meta.title}
              text={meta.text}
              action={
                <Link
                  href={meta.moreHref}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 font-display text-sm text-white"
                >
                  <Icon aria-hidden="true" size={15} />
                  See all
                </Link>
              }
            />
          </div>
          {meta.marquee ? (
            <ProductMarquee products={items} />
          ) : (
            <div className={config.layout === "row" ? "" : "px-3 sm:px-0"}>
              <ProductGrid products={items} layout={config.layout === "row" ? "row" : "grid"} hot={meta.hot} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
