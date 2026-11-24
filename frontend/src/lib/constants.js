/** Picture-first ways into the toy catalog. URLs are fixed by the store map. */
export const AUDIENCES = [
  { slug: "baby", label: "Baby", caption: "Toys for little explorers", image: "/art/who-baby.svg", color: "#FCE7F3" },
  { slug: "boys", label: "Boys", caption: "Toys for every adventure", image: "/art/who-boys.svg", color: "#E0E7FF" },
  { slug: "girls", label: "Girls", caption: "Toys for bright dreams", image: "/art/who-girls.svg", color: "#FDE68A" },
];

export const AGE_BANDS = [
  { slug: "0-1", label: "0–1", image: "/art/age-0-1.svg", color: "#FCE7F3" },
  { slug: "1-3", label: "1–3", image: "/art/age-1-3.svg", color: "#FEF3C7" },
  { slug: "3-6", label: "3–6", image: "/art/age-3-6.svg", color: "#D1FAE5" },
  { slug: "6-12", label: "6–12", image: "/art/age-6-12.svg", color: "#E0E7FF" },
  { slug: "12-plus", label: "12+", image: "/art/age-12-plus.svg", color: "#EDE9FE" },
];

/**
 * Budget chips /budget/[slug]:
 * - under-1000 → Rs 0–1,000
 * - under-3000 → Rs 0–3,000
 * - 5000-plus  → Rs 5,000 and above (no max)
 */
export const BUDGETS = [
  {
    slug: "under-1000",
    label: "Under 1,000",
    caption: "More fun, more play",
    min: 0,
    max: 1000,
    chipAmount: 1000,
    image: "/art/budget-1000.svg",
    color: "#E0E7FF",
  },
  {
    slug: "under-3000",
    label: "Under 3,000",
    caption: "Toys they talk about",
    min: 0,
    max: 3000,
    chipAmount: 3000,
    image: "/art/budget-2000.svg",
    color: "#D1FAE5",
  },
  {
    slug: "5000-plus",
    label: "Rs 5,000+",
    caption: "5,000 or more",
    min: 5000,
    max: null,
    chipAmount: 5000,
    orMore: true,
    image: "/art/budget-5000.svg",
    color: "#FCE7F3",
  },
];

/** Old budget URLs still resolve. */
const BUDGET_ALIASES = {
  "under-500": "under-1000",
  "under-2000": "under-3000",
  "under-5000": "5000-plus",
  "from-5000": "5000-plus",
};

export const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "new", label: "New" },
];

export const SORT_MORE = { id: "price-desc", label: "Price: high to low" };

/** Fallback delivery copy. Live values come from GET /settings/checkout. */
export const DELIVERY = {
  freeAt: 3000,
  nearFee: 200,
  farFee: 250,
  nearCitiesList: ["Karachi", "Lahore", "Islamabad", "Rawalpindi"],
  get nearCities() {
    const list = this.nearCitiesList || [];
    if (list.length <= 1) return list[0] || "";
    if (list.length === 2) return `${list[0]} and ${list[1]}`;
    return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
  },
};

/** Shared catalog filters when a page does not get category-specific ones. */
export const DEFAULT_FILTERS = [
  { key: "ageBands", label: "Age", type: "chips", options: ["0-1", "1-3", "3-6", "6-12", "12-plus"] },
  { key: "audience", label: "For", type: "chips", options: ["baby", "boys", "girls", "unisex"] },
  { key: "price", label: "Price", type: "range", min: 0, max: 10000 },
  { key: "inStock", label: "In stock only", type: "toggle" },
  { key: "onSale", label: "On sale", type: "toggle" },
];

export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on delivery",
    hint: "Pay the rider when your parcel arrives.",
    accent: "#0F766E",
    requiresReceipt: false,
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    hint: "Send payment, then attach your receipt screenshot.",
    accountName: "Masti Mall",
    accountNumber: "03001234567",
    accent: "#E31C79",
    requiresReceipt: true,
  },
  {
    id: "easypaisa",
    label: "EasyPaisa",
    hint: "Send payment, then attach your receipt screenshot.",
    accountName: "Masti Mall",
    accountNumber: "03007654321",
    accent: "#00A838",
    requiresReceipt: true,
  },
];

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
  "Other",
];

export const FALLBACK_HOME = {
  announcement: "COD, JazzCash & EasyPaisa across Pakistan · Wallet payments need a receipt.",
  whatsapp: "",
  nav: [
    { label: "Home", href: "/", kind: "home" },
    { label: "Toys", href: "/toys", kind: "department" },
    { label: "Decor", href: "/decor", kind: "department" },
    { label: "Sales", href: "/sales" },
    { label: "New arrivals", href: "/search?sort=new" },
  ],
  sections: [
    {
      type: "hero",
      title: "Toys + décor. Full masti.",
      order: 0,
      active: true,
      config: {
        text: "Bacchon ke toys aur ghar ka décor — dono ek jagah.",
      },
    },
    {
      type: "trust",
      title: "Why Masti Mall",
      order: 5,
      active: true,
      config: {
        points: [
          { title: "Flexible payment", text: "COD, JazzCash, or EasyPaisa. Wallet orders need a receipt at checkout." },
          { title: "Prices checked again", text: "The total is added up on our server, from the live price and stock." },
          { title: "Free delivery threshold", text: "City fees apply under the free-shipping total — live amounts show at checkout." },
          { title: "No account needed", text: "A name, a phone number, a city and an address. That is the whole checkout." },
        ],
      },
    },
  ],
};

export function ageLabel(band) {
  if (band === "12-plus") return "12+";
  return String(band).replace("-", "–");
}

export function audienceLabel(value) {
  if (value === "unisex") return "Everyone";
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function budgetBySlug(slug) {
  const key = BUDGET_ALIASES[slug] || slug;
  return BUDGETS.find((item) => item.slug === key) || null;
}

/** min/max query values for a budget band (null = open end). */
export function budgetPriceRange(budget) {
  if (!budget) return { minPrice: null, maxPrice: null };
  const min = Number(budget.min);
  const max = budget.max == null ? null : Number(budget.max);
  return {
    minPrice: Number.isFinite(min) && min > 0 ? min : null,
    maxPrice: Number.isFinite(max) && max > 0 ? max : null,
  };
}
