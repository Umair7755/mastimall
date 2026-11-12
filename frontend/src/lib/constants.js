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

export const BUDGETS = [
  { slug: "under-500", label: "Under 500", caption: "Tiny joys, big smiles", max: 500, image: "/art/budget-500.svg", color: "#FEF3C7" },
  { slug: "under-1000", label: "Under 1,000", caption: "More fun, more play", max: 1000, image: "/art/budget-1000.svg", color: "#E0E7FF" },
  { slug: "under-2000", label: "Under 2,000", caption: "Toys they talk about", max: 2000, image: "/art/budget-2000.svg", color: "#D1FAE5" },
  { slug: "under-5000", label: "Under 5,000", caption: "Gifts they will remember", max: 5000, image: "/art/budget-5000.svg", color: "#FCE7F3" },
];

export const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "new", label: "New" },
];

export const SORT_MORE = { id: "price-desc", label: "Price: high to low" };

/** Keep these numbers in step with backend/src/mall/lib/shipping.js. */
export const DELIVERY = {
  freeAt: 3000,
  nearFee: 200,
  farFee: 250,
  nearCities: "Karachi, Lahore, Islamabad and Rawalpindi",
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
    { label: "Toys", href: "/toys", kind: "department" },
    { label: "Decor", href: null, soon: true },
    { label: "Deals", href: "/search?onSale=1" },
    { label: "New arrivals", href: "/search?sort=new&isNew=1" },
  ],
  sections: [
    {
      type: "hero",
      title: "Toys + décor. Full masti.",
      order: 0,
      active: true,
      config: {
        text: "Bacchon ke toys aur ghar ka décor — dono ek jagah. Bas teen taps, asaan shopping.",
      },
    },
    { type: "categories", title: "Top categories", order: 1, active: true, config: { department: "toys", limit: 10 } },
    { type: "audience", title: "Shop for", order: 2, active: true },
    { type: "age", title: "Shop by age", order: 3, active: true },
    { type: "budget", title: "Shop by budget", order: 4, active: true, config: { limits: [500, 1000, 2000, 5000] } },
    { type: "products", title: "Hot right now", order: 5, active: true, config: { sort: "popular", featured: true, limit: 12, layout: "row" } },
    { type: "products", title: "New arrivals", order: 6, active: true, config: { sort: "new", isNew: true, limit: 12, layout: "row" } },
    {
      type: "trust",
      title: "Why Masti Mall",
      order: 7,
      active: true,
      config: {
        points: [
          { title: "Flexible payment", text: "COD, JazzCash, or EasyPaisa. Wallet orders need a receipt at checkout." },
          { title: "Prices checked again", text: "The total is added up on our server, from the live price and stock." },
          { title: "Free delivery from Rs 3,000", text: "Under that, delivery is Rs 200 in the big cities and Rs 250 elsewhere." },
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
  return BUDGETS.find((item) => item.slug === slug) || null;
}
