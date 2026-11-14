import { Armchair, Baby, BedDouble, Briefcase, Cake, Sparkles, UtensilsCrossed, Wallet } from "lucide-react";
import { AGE_BANDS, AUDIENCES, BUDGETS } from "@/lib/constants";

export const DECOR_ROOMS = [
  { slug: "living", label: "Living", Icon: Armchair, color: "#EDE9FE" },
  { slug: "bedroom", label: "Bedroom", Icon: BedDouble, color: "#FCE7F3" },
  { slug: "kids-room", label: "Kids", Icon: Baby, color: "#FEF3C7" },
  { slug: "dining", label: "Dining", Icon: UtensilsCrossed, color: "#D1FAE5" },
  { slug: "office", label: "Office", Icon: Briefcase, color: "#E0E7FF" },
];

/** Which chip groups each department shows. Add a slug here when a new department launches. */
export const DEPARTMENT_FINDER = {
  toys: ["audience", "age", "budget"],
  decor: ["room", "budget"],
};

/** Default Mall picks weight by department slug (must sum ~1). */
export const DEPARTMENT_MIX_WEIGHT = {
  toys: 0.7,
  decor: 0.3,
};

function budgetItems(budgetLimits, { department } = {}) {
  const limits = budgetLimits?.length ? budgetLimits : BUDGETS.map((item) => item.max);
  return limits.map((max) => {
    const known = BUDGETS.find((item) => item.max === Number(max));
    const slug = known?.slug || `under-${max}`;
    const href = department ? `/budget/${slug}?department=${department}` : `/budget/${slug}`;
    return {
      key: slug,
      href,
      label: `Rs ${Number(max).toLocaleString("en-PK")}`,
      sub: "max",
      image: known?.image,
      color: known?.color || "#D1FAE5",
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
  room: ({ department = "decor" } = {}) => ({
    key: "room",
    label: "Room",
    hint: "Decor",
    tone: "bg-teal-700 text-white ring-teal-200",
    Icon: Armchair,
    items: DECOR_ROOMS.map((room) => ({
      key: room.slug,
      href: `/search?department=${department}&tag=${room.slug}`,
      label: room.label,
      color: room.color,
      ChipIcon: room.Icon,
    })),
  }),
};

/** Finder groups for one department page. */
export function buildDepartmentFinderGroups(slug, { budgetLimits } = {}) {
  const keys = DEPARTMENT_FINDER[slug] || ["budget"];
  return keys.map((key) => BUILDERS[key]?.({ budgetLimits, department: slug })).filter(Boolean);
}

/**
 * Mall home: union of groups from active departments (audience/age once, room once, budget once mall-wide).
 * Pass department slugs in display order.
 */
export function buildMallFinderGroups(departmentSlugs = ["toys", "decor"], { budgetLimits } = {}) {
  const seen = new Set();
  const groups = [];
  for (const slug of departmentSlugs) {
    const keys = DEPARTMENT_FINDER[slug] || [];
    for (const key of keys) {
      if (seen.has(key)) continue;
      seen.add(key);
      // Budget on mall home stays mall-wide (no department query).
      const group = BUILDERS[key]?.({
        budgetLimits,
        department: key === "budget" ? undefined : slug,
      });
      if (group) groups.push(group);
    }
  }
  return groups;
}
