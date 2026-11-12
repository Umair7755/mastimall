import { AgePicker } from "@/components/home/AgePicker";
import { AudienceTiles } from "@/components/home/AudienceTiles";
import { BudgetTiles } from "@/components/home/BudgetTiles";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { ProductStrip } from "@/components/home/ProductStrip";
import { ReviewStrip } from "@/components/home/ReviewStrip";
import { TrustStrip } from "@/components/home/TrustStrip";

/** Clear shop flow: hero → categories → who/age/budget → hot → new → trust. */
const TYPE_ORDER = ["hero", "categories", "audience", "age", "budget", "products", "trust", "reviews"];

function productRank(section) {
  const config = section.config || {};
  if (config.featured || /hot|best|popular/i.test(section.title || "")) return 0;
  if (config.isNew || /new/i.test(section.title || "")) return 1;
  return 2;
}

function sectionRank(section) {
  const typeIndex = TYPE_ORDER.indexOf(section.type);
  const base = (typeIndex === -1 ? 99 : typeIndex) * 100;
  if (section.type === "products") return base + productRank(section);
  return base + (section.order || 0);
}

export async function HomeSections({ sections = [], departments = [] }) {
  const entries = {
    who: sections.some((section) => section.type === "audience"),
    age: sections.some((section) => section.type === "age"),
    budget: sections.some((section) => section.type === "budget"),
  };

  const sorted = [...sections].sort((a, b) => sectionRank(a) - sectionRank(b));

  const blocks = [];
  for (const section of sorted) {
    const key = `${section.type}-${section.order}-${section.title}`;
    if (section.type === "hero") {
      blocks.push(<Hero key={key} title={section.title} text={section.config?.text} entries={entries} />);
    } else if (section.type === "audience") {
      blocks.push(<AudienceTiles key={key} title="Shop for" />);
    } else if (section.type === "age") {
      blocks.push(<AgePicker key={key} title="Shop by age" />);
    } else if (section.type === "budget") {
      blocks.push(<BudgetTiles key={key} title="Shop by budget" limits={section.config?.limits} />);
    } else if (section.type === "categories") {
      const slug = section.config?.department;
      const department = departments.find((item) => item.slug === slug) || departments[0];
      blocks.push(
        <CategoryGrid key={key} title="Top categories" department={department} limit={section.config?.limit || 10} />
      );
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
