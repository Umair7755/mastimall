import {
  Armchair,
  Baby,
  Cake,
  Frame,
  Image as ImageIcon,
  Lamp,
  Sparkles,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { AGE_BANDS, AUDIENCES, BUDGETS } from "@/lib/constants";

/** Decor product types (categories) — not rooms. */
export const DECOR_TYPES = [
  { slug: "wall-art", label: "Wall art", Icon: ImageIcon, color: "#EDE9FE" },
  { slug: "cushions-throws", label: "Cushions", Icon: Armchair, color: "#FCE7F3" },
  { slug: "lamps-lighting", label: "Lamps", Icon: Lamp, color: "#FEF3C7" },
  { slug: "vases-planters", label: "Vases", Icon: UtensilsCrossed, color: "#D1FAE5" },
  { slug: "frames-mirrors", label: "Frames", Icon: Frame, color: "#E0E7FF" },
  { slug: "table-decor", label: "Table", Icon: Sparkles, color: "#FFEDD5" },
];

/** @deprecated use DECOR_TYPES — kept so old imports do not break */
export const DECOR_ROOMS = DECOR_TYPES;

/** Which chip groups each department shows. */
export const DEPARTMENT_FINDER = {
  toys: ["audience", "age", "budget"],
  decor: ["category", "budget"],
};

/** Default Mall picks weight by department slug (must sum ~1). */
export const DEPARTMENT_MIX_WEIGHT = {
  toys: 0.7,
  decor: 0.3,
};

function matchBudgetFromLimit(limit) {
  const n = Number(limit);
  if (!Number.isFinite(n)) return null;
  if (n >= 5000) return BUDGETS.find((item) => item.orMore) || null;
  return (
    BUDGETS.find((item) => item.max === n || item.chipAmount === n) ||
    BUDGETS.filter((item) => item.max != null).sort((a, b) => a.max - b.max).find((item) => n <= item.max) ||
    null
  );
}

function budgetItems(budgetLimits, { department } = {}) {
  const bands = budgetLimits?.length
    ? [
        ...new Map(
          budgetLimits
            .map((limit) => matchBudgetFromLimit(limit))
            .filter(Boolean)
            .map((band) => [band.slug, band])
        ).values(),
      ]
    : BUDGETS;

  return bands.map((band) => {
    const amount = band.chipAmount ?? (band.orMore ? band.min : band.max);
    const href = department ? `/budget/${band.slug}?department=${department}` : `/budget/${band.slug}`;
    return {
      key: band.slug,
      href,
      label: `Rs ${Number(amount).toLocaleString("en-PK")}`,
      sub: band.orMore ? "or more" : "max",
      image: band.image,
      color: band.color || "#D1FAE5",
      emphasis: "budget",
    };
  });
}

const BUILDERS = {
  audience: () => ({
    key: "who",
    label: "For",
    hint: "Who",
    tone: "bg-[#4f46e5] text-white ring-[#c7d2fe]",
    Icon: Sparkles,
    items: AUDIENCES.map((item) => ({
      key: item.slug,
      href: `/for/${item.slug}`,
      label: item.label,
      image: item.image,
      color: item.color,
    })),
  }),
  age: () => ({
    key: "age",
    label: "Age",
    hint: "Yrs",
    tone: "bg-[#f59e0b] text-ink ring-[#fde68a]",
    Icon: Cake,
    items: AGE_BANDS.map((item) => ({
      key: item.slug,
      href: `/age/${item.slug}`,
      label: item.label,
      sub: "yrs",
      image: item.image,
      color: item.color,
      emphasis: "age",
    })),
  }),
  budget: ({ budgetLimits, department } = {}) => ({
    key: "budget",
    label: "Budget",
    hint: "Rs",
    tone: "bg-[#059669] text-white ring-[#a7f3d0]",
    Icon: Wallet,
    items: budgetItems(budgetLimits, { department }),
  }),
  category: ({ department = "decor" } = {}) => ({
    key: "type",
    label: "Type",
    hint: "Decor",
    tone: "bg-teal-700 text-white ring-teal-200",
    Icon: ImageIcon,
    items: DECOR_TYPES.map((item) => ({
      key: item.slug,
      href: `/${department}/${item.slug}`,
      label: item.label,
      color: item.color,
      ChipIcon: item.Icon,
    })),
  }),
  /** Alias so older “room” keys still resolve to decor types */
  room: (opts) => BUILDERS.category(opts),
};

/** Finder groups for one department page. */
export function buildDepartmentFinderGroups(slug, { budgetLimits } = {}) {
  const keys = DEPARTMENT_FINDER[slug] || ["budget"];
  return keys.map((key) => BUILDERS[key]?.({ budgetLimits, department: slug })).filter(Boolean);
}

/**
 * Mall home: union of groups from active departments (audience/age once, type once, budget once).
 */
export function buildMallFinderGroups(departmentSlugs = ["toys", "decor"], { budgetLimits } = {}) {
  const seen = new Set();
  const groups = [];
  for (const slug of departmentSlugs) {
    const keys = DEPARTMENT_FINDER[slug] || [];
    for (const key of keys) {
      if (seen.has(key)) continue;
      seen.add(key);
      const group = BUILDERS[key]?.({
        budgetLimits,
        department: key === "budget" ? undefined : slug,
      });
      if (group) groups.push(group);
    }
  }
  return groups;
}
