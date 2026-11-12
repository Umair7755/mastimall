import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";
import { getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTAINER } from "@/lib/layout";

function stripMeta(section) {
  const config = section.config || {};
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
      moreHref: "/search?sort=new&isNew=1",
      hot: false,
      shell: "bg-white",
    };
  }
  return {
    title: section.title,
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
  params.set("sort", config.sort || "popular");
  if (config.isNew) params.set("isNew", "1");
  if (config.featured) params.set("featured", "1");
  if (config.department) params.set("department", config.department);
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
    <section className={`${CONTAINER} py-3 lg:py-5`}>
      <div className={`rounded-[1.5rem] ${meta.shell} p-3 sm:p-4 lg:p-5`}>
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
        <ProductGrid products={items} layout={config.layout === "row" ? "row" : "grid"} hot={meta.hot} />
      </div>
    </section>
  );
}
