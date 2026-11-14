import { FindToysRail } from "@/components/home/FindToysRail";
import { Hero } from "@/components/home/Hero";
import { ProductStrip } from "@/components/home/ProductStrip";
import { ReviewStrip } from "@/components/home/ReviewStrip";
import { TrustStrip } from "@/components/home/TrustStrip";

/** Hero → find chips (visible on land) → all / hot / new → trust. */
const TYPE_ORDER = ["hero", "finder", "products", "trust", "reviews"];

const ALL_PRODUCTS_SECTION = {
  type: "products",
  title: "All toys",
  order: 2,
  active: true,
  config: { all: true, sort: "new", limit: 24, layout: "row" },
};

function productRank(section) {
  const config = section.config || {};
  if (config.all || config.catalog) return 0;
  if (config.featured || /hot|best|popular/i.test(section.title || "")) return 1;
  if (config.isNew || /new/i.test(section.title || "")) return 2;
  return 3;
}

function sectionRank(section) {
  const typeIndex = TYPE_ORDER.indexOf(section.type);
  const base = (typeIndex === -1 ? 99 : typeIndex) * 100;
  if (section.type === "products") return base + productRank(section);
  return base + (section.order || 0);
}

/** Map legacy home config (categories / audience / age / budget) into the product-first layout. */
export function normalizeHomeSections(sections = []) {
  const list = Array.isArray(sections) ? sections.filter((section) => section && section.active !== false) : [];
  const budgetSection = list.find((section) => section.type === "budget");
  const wantsFinder = list.some((section) => ["audience", "age", "budget", "finder"].includes(section.type));

  const kept = list.filter((section) => !["categories", "audience", "age", "budget", "finder"].includes(section.type));

  const hasAllRail = kept.some(
    (section) => section.type === "products" && (section.config?.all || section.config?.catalog)
  );
  if (!hasAllRail) {
    kept.push(ALL_PRODUCTS_SECTION);
  }

  if (wantsFinder || list.length === 0) {
    kept.push({
      type: "finder",
      title: "Find toys",
      order: 1,
      active: true,
      config: { limits: budgetSection?.config?.limits || [500, 1000, 2000, 5000] },
    });
  }

  return kept.sort((a, b) => sectionRank(a) - sectionRank(b));
}

export async function HomeSections({ sections = [], departments = [] }) {
  void departments;
  const normalized = normalizeHomeSections(sections);
  const entries = {
    who: true,
    age: true,
    budget: true,
  };

  const blocks = [];
  for (const section of normalized) {
    const key = `${section.type}-${section.order}-${section.title}`;
    if (section.type === "hero") {
      blocks.push(<Hero key={key} title={section.title} text={section.config?.text} entries={entries} />);
    } else if (section.type === "finder") {
      blocks.push(<FindToysRail key={key} budgetLimits={section.config?.limits} />);
    } else if (section.type === "products") {
      const strip = await ProductStrip({ section });
      if (strip) blocks.push(<div key={key}>{strip}</div>);
    } else if (section.type === "trust") {
      blocks.push(<TrustStrip key={key} title={section.title} points={section.config?.points} />);
    } else if (section.type === "reviews") {
      blocks.push(<ReviewStrip key={key} title={section.title} items={section.config?.items} />);
    }
  }

  return <div className="space-y-1 pb-4">{blocks}</div>;
}
