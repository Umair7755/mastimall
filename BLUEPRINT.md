# Masti Mall: Build Blueprint

The single source of truth for building the Masti Mall online store. Put this file in the repo root and read it before writing any code. If you build with an AI assistant, tell it to read this file first and follow sections 2, 6 and 18 strictly.

---

## 1. Project summary

| Item | Decision |
|---|---|
| Store name | **Masti Mall** |
| Launch department | **Toys** |
| Future departments | Home Decor, then anything else (Gifts, Kitchenware, ...) |
| Audience | Parents in Pakistan, mostly on mid-range Android phones. Kids browse by pictures, parents pay. |
| Frontend | Next.js (App Router) + JavaScript + Tailwind CSS |
| Backend | Existing Express + MongoDB API |
| Reference | toyzone.pk was studied for structure only (age and budget navigation, cart add-ons, WhatsApp support). We do **not** copy its design, text or images. |

**Goals**

1. Rank well on Google (server-rendered catalog, clean URLs, structured data).
2. Look beautiful, with real animation and 3D used where they add value.
3. Pass the **4-year-old test**: a child can browse by pictures and fill a cart, and a parent can finish the order in under a minute.
4. Add new departments later by adding data, not by rewriting code.

**Not in v1**: multi-vendor marketplace, native mobile app, Urdu translation (planned for later), user reviews with photos.

---

## 2. Principles (non-negotiable)

1. **Pictures first, words second.** Every category, age band and budget band is a big picture tile.
2. **Data-driven everything.** Departments, categories, filters and homepage sections live in MongoDB. Never write `if (department === "toys")`.
3. **SEO by default.** Every catalog page is server-rendered with metadata and JSON-LD.
4. **Motion with a purpose.** One orchestrated moment (the hero). Everywhere else, motion answers a tap: add to cart, open drawer, confirm order.
5. **Fast on cheap phones.** 3D is lazy-loaded, optional, and always has a static fallback.
6. **The server owns the truth.** Prices, stock and totals are recomputed on the API. Never trust the browser.

---

## 3. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js, App Router | Server Components by default. Add `"use client"` only where needed. |
| Language | JavaScript (ES2022) | Use JSDoc comments on shared helpers for editor hints. |
| Styling | Tailwind CSS (v4, CSS-first `@theme`) | Tokens in section 6. If your project is on v3, move the same tokens into `tailwind.config.js`. |
| Animation | `motion` (the library formerly called Framer Motion) | `import { motion } from "motion/react"` |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` | Use R3F v9 with React 19. Hero scene and product viewer only. |
| State | Zustand (+ `persist`) | Cart and wishlist. Filters live in the **URL**, not in state. |
| Forms | React Hook Form + Zod | Checkout and account forms. |
| Images | Next `<Image>` + Cloudinary (or similar) | AVIF/WebP, responsive sizes, lazy by default. |
| Fonts | `next/font/google` | Fredoka (display) + Nunito Sans (body). Self-hosted at build time. |
| Effects | `canvas-confetti` | Order success only. |
| API | Existing Express + Mongoose | Additions listed in section 10. |
| Search | MongoDB text index first, Atlas Search later | Add typo tolerance and autocomplete when the catalog grows. |
| Analytics | GA4 + Google Search Console (+ Meta Pixel if you run ads) | |

**Install (frontend)**

```bash
npx create-next-app@latest masti-mall-web
# choose: JavaScript, ESLint, Tailwind CSS, src/ directory, App Router, alias @/*

cd masti-mall-web
npm i motion zustand zod react-hook-form @hookform/resolvers canvas-confetti
npm i three @react-three/fiber @react-three/drei
npm i -D prettier prettier-plugin-tailwindcss
```

**Install (API additions, if not present)**

```bash
npm i helmet cors express-rate-limit cookie-parser zod bcryptjs jsonwebtoken
```

> Check peer-dependency versions when installing. React Three Fiber, drei, React and Next must be compatible with each other.

---

## 4. Architecture

```
 Browser (phone / desktop)
        │
        ▼
 Next.js app  ── server components fetch ──►  Express API  ──►  MongoDB
 (SSG / ISR)    (cached, tagged)              (REST, JSON)     (Atlas)
        ▲                                         │
        └──── on-demand revalidation webhook ◄────┘
              (API calls /api/revalidate when a product changes)

 Images ──► Cloudinary (or similar) ──► next/image
 3D models (.glb) ──► /public/models or CDN (Draco-compressed)
```

- Catalog pages are **statically generated and revalidated** (ISR), so Google and customers get fast HTML.
- Cart, wishlist, checkout and account are **client-side interactive** and talk to the API.
- When the admin edits a product, the API pings the Next `/api/revalidate` route with a secret, and the affected pages refresh.

---

## 5. Folder structure

```
masti-mall-web/
├─ public/
│  ├─ models/                 # optimized .glb files
│  ├─ posters/                # static fallbacks for 3D scenes
│  └─ icons/
├─ src/
│  ├─ app/
│  │  ├─ layout.js            # fonts, header, footer, providers
│  │  ├─ page.js              # homepage (data-driven sections)
│  │  ├─ globals.css          # Tailwind + design tokens
│  │  ├─ sitemap.js
│  │  ├─ robots.js
│  │  ├─ [department]/
│  │  │  ├─ page.js           # department landing
│  │  │  └─ [category]/
│  │  │     ├─ page.js        # category listing + URL-based filters
│  │  │     └─ [slug]/page.js # product page
│  │  ├─ for/[audience]/page.js    # baby | boys | girls
│  │  ├─ age/[band]/page.js        # 0-1 | 1-3 | 3-6 | 6-12 | 12-plus
│  │  ├─ budget/[limit]/page.js    # under-500 | under-1000 | ...
│  │  ├─ search/page.js
│  │  ├─ cart/page.js
│  │  ├─ checkout/page.js
│  │  ├─ order/[orderNumber]/page.js   # success + tracking
│  │  ├─ wishlist/page.js
│  │  ├─ account/...
│  │  └─ api/revalidate/route.js
│  ├─ components/
│  │  ├─ ui/                  # Button, Chip, Badge, Input, Drawer, Skeleton
│  │  ├─ layout/              # Header, MegaMenu, MobileNav, Footer, AnnouncementBar
│  │  ├─ home/                # Hero, AudienceTiles, AgePicker, BudgetTiles, CategoryGrid
│  │  ├─ product/             # ProductCard, Gallery, Viewer3D, QtyStepper, PriceTag
│  │  ├─ cart/                # CartDrawer, CartLine, FlyToCart
│  │  ├─ three/               # HeroScene, ProductViewer, Poster fallbacks
│  │  └─ seo/                 # JsonLd, Breadcrumbs
│  ├─ lib/                    # api.js, format.js (PKR), seo.js, constants.js
│  ├─ store/                  # cart.js, wishlist.js (Zustand)
│  └─ hooks/                  # useCan3D.js, useInView.js
├─ next.config.js
├─ .env.local
└─ BLUEPRINT.md
```

**Reserved slugs** (a department or category may never use these, because static routes win over dynamic ones): `cart`, `checkout`, `search`, `account`, `track`, `wishlist`, `for`, `age`, `budget`, `order`, `api`, `blog`, `admin`. The API must reject them when creating a department.

---

## 6. Design system

### 6.1 Direction

Masti Mall should feel like a **well-made toy box**: chunky, tactile, bright but organized. Plain light surfaces let the toys be the colorful thing. The signature detail is the **toy-block press**: buttons and chips have a solid colored base that squashes down when pressed. It is playful, it shows a child exactly what is tappable, and it costs almost nothing to build.

The boldest moment on the site is the **3D hero** (floating toy blocks). Everything else stays calm and disciplined.

### 6.2 Color tokens

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FAFAF7` | Page background |
| `surface` | `#FFFFFF` | Cards, header, drawers |
| `brand` | `#4F46E5` | Primary buttons, links, active states |
| `brand-dark` | `#3730A3` | Button base shadow, hover, footer |
| `brand-soft` | `#EEF0FF` | Selected chips, soft section backgrounds |
| `sun` | `#FBBF24` | Sale badge, "New", highlights (text on it is always `ink`) |
| `coral` | `#FB7185` | Wishlist heart, small decorative touches (never behind white text) |
| `ink` | `#0F172A` | Headings and body text |
| `ink-muted` | `#64748B` | Secondary text, old prices |
| `line` | `#E2E8F0` | Borders and dividers |
| `success` | `#22C55E` | In stock, order confirmed |
| `danger` | `#DC2626` | Errors, out of stock |

Usage ratio: about 70% neutrals, 20% brand, 10% sun/coral. Category tiles may use their own pastel `color` from the database so the grid feels alive.

**Contrast rules**: white text only on `brand`, `brand-dark`, `ink`. Dark `ink` text on `sun`, `brand-soft`, `canvas`. Never white on `sun` or `coral`.

### 6.3 `globals.css` (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  --color-canvas: #FAFAF7;
  --color-surface: #FFFFFF;
  --color-brand: #4F46E5;
  --color-brand-dark: #3730A3;
  --color-brand-soft: #EEF0FF;
  --color-sun: #FBBF24;
  --color-coral: #FB7185;
  --color-ink: #0F172A;
  --color-ink-muted: #64748B;
  --color-line: #E2E8F0;
  --color-success: #22C55E;
  --color-danger: #DC2626;

  --font-display: var(--font-fredoka), ui-rounded, system-ui, sans-serif;
  --font-body: var(--font-nunito-sans), system-ui, sans-serif;

  --radius-card: 1.5rem;      /* product cards, tiles */
  --radius-media: 1rem;       /* images inside cards */
  --radius-field: 1rem;       /* inputs */

  --shadow-press: 0 4px 0 0 var(--color-brand-dark);
  --shadow-press-sun: 0 4px 0 0 #B7791F;
  --shadow-lift: 0 12px 24px -12px rgb(15 23 42 / 0.25);
}

body {
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 1.0625rem;      /* 17px base: easier to read */
  line-height: 1.6;
}

h1, h2, h3 { font-family: var(--font-display); line-height: 1.15; }

/* Per-department theme. Utilities read these variables, so overriding them re-themes a whole section. */
[data-department="decor"] {
  --color-brand: #4C6B5C;
  --color-brand-dark: #34493F;
  --color-brand-soft: #E8EFEA;
  --color-sun: #D9A35B;
  --shadow-press: 0 4px 0 0 var(--color-brand-dark);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}

:focus-visible { outline: 3px solid var(--color-sun); outline-offset: 3px; }
```

> The decor theme above is a proposal. Finalize it when you start the decor department.

### 6.4 Fonts (`src/app/layout.js`)

```js
import { Fredoka, Nunito_Sans } from "next/font/google";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans", display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- **Fredoka**: headlines, buttons, prices. Chunky and round, it carries the toy personality.
- **Nunito Sans**: body, descriptions, forms. Calm and very readable.

### 6.5 Type scale

| Role | Mobile | Desktop | Font |
|---|---|---|---|
| Display (hero) | 40px | 64px | Fredoka 600 |
| H1 | 32px | 44px | Fredoka 600 |
| H2 | 24px | 32px | Fredoka 600 |
| H3 | 20px | 22px | Fredoka 500 |
| Body | 17px | 18px | Nunito Sans 400 |
| Small | 14px | 14px | Nunito Sans 400 |
| Price | 22px | 26px | Fredoka 600 |

Keep paragraphs under about 70 characters wide. Use sentence case everywhere. No all-caps labels.

### 6.6 Shape and component rules

Radii follow hierarchy, not one value everywhere: **pills** for buttons, chips and badges; **24px** for cards and tiles; **16px** for images and inputs.

| Component | Rules |
|---|---|
| **Primary button** | Pill, `bg-brand text-white`, min height 56px, Fredoka 18px, `shadow-press`; on press it moves down 4px and loses the shadow. |
| **Secondary button** | Pill, white with 2px `ink` border, same press behavior. |
| **Sale / add button** | `bg-sun text-ink` with `shadow-press-sun`. Use sparingly. |
| **Chip** (age, budget, filter) | Pill, min height 48px, selected = `brand-soft` + 2px `brand` border. |
| **Category tile** | 24px radius, pastel background from `category.color`, toy image slightly breaking out of the frame, name below in Fredoka. At least 120px square on mobile. |
| **Product card** | White, 24px radius, square image, title max 2 lines, price + struck old price, one "Add" button, heart in the corner. Soft `shadow-lift` on hover (desktop only). |
| **Input** | 16px radius, 56px tall, visible label above (not placeholder-only), 2px `line` border, `brand` border on focus. |
| **Badge** | Pill. `sun` for sale/new, `success` for in stock, `danger` for out of stock. |

**Button example**

```jsx
<button className="min-h-14 rounded-full bg-brand px-8 font-display text-lg text-white shadow-press transition-transform active:translate-y-1 active:shadow-none">
  Add to cart
</button>
```

### 6.7 Voice and microcopy

Plain, friendly, specific. Sentence case. Same name for the same action throughout.

| Moment | Copy |
|---|---|
| Add button | "Add to cart" then toast "Added to cart" |
| Empty cart | "Your cart is empty. Pick a toy to start." |
| Phone error | "Phone number should look like 03XX-XXXXXXX." |
| Out of stock | "Sold out right now" + "Tell me when it's back" |
| Order success | "Order placed! We'll confirm on WhatsApp soon." |
| Hero headline | "Find the right toy in three taps." |

Roman Urdu may be used sparingly for warmth in banners ("Masti time!"), never in forms or errors.

### 6.8 Design don'ts

- No emoji in navigation or buttons. Use proper icons (Lucide or custom SVG).
- No gradient washes behind sections.
- No all-caps eyebrow labels above headings.
- No single colored or italic word inside a headline.
- No arrow glyph glued to every button label.
- No more than **one** announcement message visible at a time.
- No identical soft grey shadow on everything. Shadows are for lift (hover) and press (buttons).

---

## 7. Layouts

### 7.1 Homepage (desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ One announcement line (delivery / offer)                        │
├──────────────────────────────────────────────────────────────────┤
│ [Masti Mall]  [ search ................................ ]       │
│               [wishlist] [account] [cart 2]                      │
│ Toys ▾    Decor (soon)    Deals    New arrivals                  │
├──────────────────────────────────────────────────────────────────┤
│                                          ╭───────────────────╮   │
│  Find the right toy                      │  3D floating toy  │   │
│  in three taps.                          │  blocks, react to │   │
│                                          │  the pointer      │   │
│  [ For who? ] [ What age? ] [ Budget ]   ╰───────────────────╯   │
├──────────────────────────────────────────────────────────────────┤
│ Who is it for?     [ Baby ]   [ Boys ]   [ Girls ]               │
├──────────────────────────────────────────────────────────────────┤
│ Pick an age        (0-1) (1-3) (3-6) (6-12) (12+)                │
├──────────────────────────────────────────────────────────────────┤
│ Pick a budget      [Under 500] [Under 1,000] [Under 2,000] [...] │
├──────────────────────────────────────────────────────────────────┤
│ Categories         8 to 10 big picture tiles, "More" tile last   │
├──────────────────────────────────────────────────────────────────┤
│ New arrivals       horizontal scroll of product cards            │
├──────────────────────────────────────────────────────────────────┤
│ Best sellers       grid of product cards                         │
├──────────────────────────────────────────────────────────────────┤
│ Why Masti Mall     4 short, truthful trust points                │
├──────────────────────────────────────────────────────────────────┤
│ Reviews            3 to 6 real customer reviews                  │
├──────────────────────────────────────────────────────────────────┤
│ Footer             links, contact, WhatsApp, payment + couriers  │
└──────────────────────────────────────────────────────────────────┘
```

Hero alignment: text left-aligned, 3D scene on the right. On mobile the scene sits **above** the headline at about 40% of the screen height, and the three entry buttons stack full-width.

Sections are rendered from a `homepageSections` config in MongoDB (type, title, order, active), so you can reorder, hide or add sections (for example a Decor block) without a deploy. Only claim what is true in the trust strip (original products, delivery times, return policy).

### 7.2 Mobile shell

```
┌────────────────────────┐
│ [menu] Masti Mall [♡][cart 2] │   sticky top
├────────────────────────┤
│  ... content ...       │
├────────────────────────┤
│ Home | Shop | Cart | Me│   sticky bottom nav, 64px, big icons + label
└────────────────────────┘
```

Shop opens a full-screen category picture grid, not a text menu.

### 7.3 Product page

```
Mobile                          Desktop
┌─────────────────────┐        ┌───────────────┬───────────────────┐
│ Gallery (swipe)     │        │ Gallery       │ Title             │
│ [photos] [3D view]  │        │ [photos][3D]  │ Age badge, stock  │
├─────────────────────┤        │               │ Price + old price │
│ Title, age, stock   │        │               │ Qty  [Add to cart]│
│ Price + old price   │        │               │ [Ask Mom/Dad]     │
│ Qty stepper         │        │               │ Delivery info     │
│ Delivery info       │        ├───────────────┴───────────────────┤
│ Description         │        │ Description / details / reviews   │
│ Related toys        │        │ Related toys                      │
├─────────────────────┤        └───────────────────────────────────┘
│ [ Add to cart ]     │  sticky bottom bar
└─────────────────────┘
```

The 3D tab appears only if the product has a `.glb` model. Without one, the gallery is just photos.

### 7.4 Cart and checkout

- **Cart drawer**: slides in after "Add to cart". Shows product pictures, big qty steppers, subtotal, and two buttons: "Keep shopping" and "Checkout".
- **Checkout is one page, one column**: name, phone, city, address, notes (optional), payment method (Cash on delivery selected by default), order summary, big "Place order" button. Guest checkout only in v1.
- **Order success**: confetti, order number, summary, "Track order" and "Continue shopping".

---

## 8. Categories and navigation

### 8.1 Rules

- **Two levels only**: Department → Category. Never deeper. Too many products in one category? Add filters, not more levels.
- **8 to 10 top categories** shown as picture tiles. The rest go under "More".
- Every product belongs to exactly one category, plus **attributes** that power the three quick entry points.

### 8.2 Three ways in (easiest first)

| Entry point | Values | URL |
|---|---|---|
| **Who is it for?** | Baby, Boys, Girls | `/for/baby`, `/for/boys`, `/for/girls` |
| **What age?** | 0-1, 1-3, 3-6, 6-12, 12+ | `/age/0-1` ... `/age/12-plus` |
| **What budget?** | Under 500, 1,000, 2,000, 5,000 | `/budget/under-500` ... |

Plus the normal route: `/toys/remote-control-cars`.

**Kid-safe browsing**: products whose only age band is `12+` are hidden from the Baby / Boys / Girls entry points and from the `0-1` to `6-12` age pages by default. They remain available in their own category and in search, with a clear age label. Decide separately whether to sell items such as gel blasters at all, and if you do, keep them in their own category with a prominent age warning.

### 8.3 Starter category tree for Toys

Names are examples; adjust to your real inventory. Each category needs an image, a pastel color and an order number.

| Category | Sub-grouping ideas (as filters, not levels) |
|---|---|
| Remote control | cars, trucks and excavators, helicopters, drones |
| Vehicles and ride-ons | die-cast, ride-on cars and bikes, bicycles and tricycles, scooters, train sets |
| Baby toys | rattles, teethers, soft books, activity toys |
| Dolls and pretend play | dolls, doll houses, kitchen sets, costumes |
| Building and puzzles | blocks, puzzles and cubes, magnetic toys |
| Learning and creative | science kits, art and craft, writing tablets, wooden toys |
| Outdoor and water play | swings and slides, pools, bubble makers |
| Games and fun | board games, cards, magic tricks |
| Soft toys | plush, character toys |
| Gift ideas | mystery boxes, under-budget bundles |

### 8.4 Filters (stored in the category, not in code)

```js
// Toys categories
[
  { key: "ageBands", label: "Age",   type: "chips" },
  { key: "audience", label: "For",   type: "chips" },
  { key: "price",    label: "Price", type: "range" },
  { key: "brand",    label: "Brand", type: "select" },
  { key: "inStock",  label: "In stock only", type: "toggle" },
  { key: "onSale",   label: "On sale", type: "toggle" },
]

// Future Decor categories
[
  { key: "room",     label: "Room",     type: "chips" },
  { key: "material", label: "Material", type: "select" },
  { key: "color",    label: "Color",    type: "swatches" },
  { key: "size",     label: "Size",     type: "select" },
]
```

The UI has one `FilterPanel` that renders whatever filter list the category provides. Selected filters are written to the URL (`?age=3-6&price=0-1000&sort=popular`), so filtered pages are shareable and the back button works.

### 8.5 Sorting

Only three options: **Popular**, **Price: low to high**, **New**. A fourth ("Price: high to low") can be tucked into a menu.

### 8.6 Adding a new department later (checklist)

1. Create the `Department` record (name, slug, theme key, banner, SEO text). Set `active: true`.
2. Create its categories and each category's `filters`.
3. Add a theme block in `globals.css` for `[data-department="<theme>"]` if it needs its own colors.
4. Add products with the matching `attributes`.
5. Add a "Shop by department" section to the homepage config.

No new route files are required.

---

## 9. Data models (Mongoose)

> Adapt to your existing models. Examples use CommonJS; switch to `import` if your API uses ES modules.

```js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const Department = model("Department", new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  themeKey: { type: String, default: "toys" },     // matches data-department in CSS
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  banner: { url: String, alt: String },
  seo: { title: String, description: String },
}, { timestamps: true }));

const Category = model("Category", new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, lowercase: true },
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
  image: { url: String, alt: String },
  color: { type: String, default: "#EEF0FF" },     // pastel tile background
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  filters: [{ key: String, label: String, type: String, options: [String] }],
  seo: { title: String, description: String, intro: String },
}, { timestamps: true }));
// unique slug per department
Category.schema.index({ department: 1, slug: 1 }, { unique: true });

const Product = model("Product", new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  sku: { type: String, unique: true, sparse: true },
  description: String,                              // sanitized HTML or markdown
  highlights: [String],                             // 3 to 5 short bullets
  price: { type: Number, required: true },          // PKR, regular price
  salePrice: Number,                                // PKR, optional
  stock: { type: Number, default: 0 },
  images: [{ url: String, alt: String }],
  model3d: { glbUrl: String, posterUrl: String },   // optional 3D viewer
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  audience: [{ type: String, enum: ["baby", "boys", "girls", "unisex"] }],
  ageBands: [{ type: String, enum: ["0-1", "1-3", "3-6", "6-12", "12-plus"] }],
  brand: String,
  tags: [String],
  attributes: { type: Map, of: String },            // decor: material, room, color...
  weightGrams: Number,
  fragile: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "active", "archived"], default: "draft" },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  seo: { title: String, description: String },
}, { timestamps: true }));

Product.schema.index({ department: 1, category: 1, status: 1 });
Product.schema.index({ ageBands: 1, status: 1 });
Product.schema.index({ audience: 1, status: 1 });
Product.schema.index({ price: 1 });
Product.schema.index({ title: "text", tags: "text", brand: "text" });

const Order = model("Order", new Schema({
  orderNumber: { type: String, unique: true, index: true },   // e.g. MM-240001
  user: { type: Schema.Types.ObjectId, ref: "User" },         // optional (guest checkout)
  items: [{
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    title: String, slug: String, image: String,               // snapshot at order time
    unitPrice: Number, qty: Number,
  }],
  customer: { name: String, phone: String, city: String, address: String, notes: String },
  payment: {
    method: { type: String, enum: ["cod", "jazzcash", "easypaisa", "bank"], default: "cod" },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  },
  shipping: { courier: String, trackingNumber: String, fee: { type: Number, default: 0 } },
  subtotal: Number,
  total: Number,
  status: {
    type: String,
    enum: ["new", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"],
    default: "new",
  },
  source: { type: String, enum: ["web", "wishlist-whatsapp"], default: "web" },
}, { timestamps: true }));

const User = model("User", new Schema({
  name: String,
  phone: { type: String, index: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  passwordHash: String,
  addresses: [{ label: String, city: String, address: String }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
}, { timestamps: true }));
```

Homepage sections can be a small `Setting` document: `{ key: "home", sections: [{ type, title, order, active, config }] }`.

---

## 10. API endpoints

All responses are JSON. All write routes validate input with Zod. Prices and totals are **always recomputed on the server**.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/departments` | Active departments (header, homepage) |
| GET | `/api/departments/:slug` | One department + its categories |
| GET | `/api/categories/:department/:slug` | Category + filter config |
| GET | `/api/products` | List with query: `department, category, audience, age, minPrice, maxPrice, brand, inStock, onSale, sort, page, limit, q` |
| GET | `/api/products/:slug` | Product detail + related products |
| GET | `/api/products/slugs` | All active slugs (for sitemap and static generation) |
| GET | `/api/search/suggest?q=` | Autocomplete (top 6 matches) |
| GET | `/api/settings/home` | Homepage section config |
| POST | `/api/orders` | Create order (guest or logged-in) |
| GET | `/api/orders/:orderNumber?phone=` | Track an order (phone must match) |
| POST | `/api/auth/register` `/login` `/logout` | Optional accounts (httpOnly cookie) |
| GET/POST | `/api/wishlist` | Logged-in wishlist sync |
| POST | `/api/admin/*` | Admin CRUD (role = admin only) |

**Order creation flow on the API**: validate body → load products by id → check stock → recompute prices (use `salePrice` if set) → compute shipping → generate `orderNumber` → save → decrement stock → notify (WhatsApp/email) → return `{ orderNumber }`.

Pagination: `page` + `limit` (default 24, max 48). Return `{ items, total, page, pages }`.

---

## 11. Animation and 3D

### 11.1 The plan in one sentence

One big orchestrated moment (the 3D hero), plus small motions that respond to what the person just did.

### 11.2 Motion catalog

| Moment | Trigger | Tool | Duration / feel |
|---|---|---|---|
| Hero blocks drop in and settle | Page load, once | R3F + spring | about 1.2s, then gentle idle float |
| Hero blocks follow the pointer | Pointer move | R3F `useFrame` | Subtle (max about 15 degrees) |
| Button press | Tap / click | CSS transform | 100ms, shadow collapses |
| Add to cart: product image flies to cart icon | Tap "Add" | `motion` layout / `animate` | about 500ms |
| Cart badge bounce | Item added | `motion` | spring, about 300ms |
| Cart drawer open | Tap cart | `motion` + `AnimatePresence` | spring, about 350ms |
| Filter sheet open (mobile) | Tap filter | `motion` bottom sheet | about 300ms |
| Heart toggle | Tap heart | `motion` scale pop | about 250ms |
| Product image swap | Swipe / tap thumb | `motion` crossfade | about 200ms |
| Order success confetti | Order placed | `canvas-confetti` | about 2s, once |
| Skeleton shimmer | While loading | CSS | loop, subtle |
| Section reveal on scroll | Enter viewport | **Avoid** on most sections | Only on 1 or 2 places, if at all |

Rules:

- Keep durations between **150ms and 500ms**. Springs for things that move; fades for things that appear.
- Never block the next tap while an animation plays.
- Do **not** add fade-and-slide to every section or hover lift to every card. It reads as generic.
- Respect `prefers-reduced-motion`: use `useReducedMotion()` from `motion/react` and skip movement, keeping only simple fades.

### 11.3 3D rules and budgets

3D appears in exactly two places:

1. **Hero scene**: floating, chunky toy blocks in brand colors. Built from code (rounded boxes), so there is **no model download**.
2. **Product 3D viewer**: rotate and zoom a `.glb` model, only for products that have one.

Budgets and safeguards:

- Each `.glb` under **500 KB** (compress with `gltf-transform` + Draco; textures as WebP or KTX2).
- Load with `next/dynamic` and `ssr: false`. Show a static poster image first and swap when the scene is ready.
- `<Canvas dpr={[1, 1.5]}>` to cap pixel density.
- Product viewer uses `frameloop="demand"` (renders only when you interact). The hero pauses when offscreen.
- Skip 3D entirely when: `prefers-reduced-motion`, Data Saver is on, device has 2 or fewer CPU cores, or WebGL is unavailable. Show the poster instead.
- The poster image is the LCP element, so it must be fast. 3D must never delay the first paint.

### 11.4 Capability hook (`src/hooks/useCan3D.js`)

```js
"use client";
import { useEffect, useState } from "react";

export function useCan3D() {
  const [can, setCan] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData === true;
    const weakCpu = (navigator.hardwareConcurrency ?? 4) <= 2;
    const lowMemory = (navigator.deviceMemory ?? 4) <= 2;

    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {}

    setCan(webgl && !reduce && !saveData && !weakCpu && !lowMemory);
  }, []);

  return can;
}
```

### 11.5 Lazy hero wrapper (`src/components/three/Hero3D.js`)

```jsx
"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCan3D } from "@/hooks/useCan3D";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function Hero3D() {
  const can3D = useCan3D();
  return (
    <div className="relative aspect-square w-full max-w-xl">
      {/* Poster is always rendered first: it is the LCP image and the fallback */}
      <Image src="/posters/hero.webp" alt="Colorful toy blocks floating" fill priority sizes="(min-width: 1024px) 560px, 90vw" />
      {can3D && <div className="absolute inset-0"><HeroScene /></div>}
    </div>
  );
}
```

### 11.6 Hero scene (`src/components/three/HeroScene.js`)

```jsx
"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";

const BLOCKS = [
  { pos: [-1.4, 0.6, 0],   color: "#4F46E5", rot: [0.3, 0.4, 0],   size: 1.2 },
  { pos: [0.4, -0.4, 0.4], color: "#FBBF24", rot: [0.1, -0.5, 0.2], size: 1.0 },
  { pos: [1.5, 0.9, -0.3], color: "#FB7185", rot: [0.4, 0.2, -0.1], size: 0.9 },
  { pos: [-0.3, 1.6, -0.6], color: "#22C55E", rot: [0.2, 0.6, 0.3], size: 0.8 },
];

function Block({ pos, color, rot, size }) {
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.1}>
      <RoundedBox args={[size, size, size]} radius={size * 0.18} smoothness={4} position={pos} rotation={rot}>
        <meshStandardMaterial color={color} roughness={0.35} />
      </RoundedBox>
    </Float>
  );
}

function Rig({ children }) {
  const group = useRef();
  useFrame((state, delta) => {
    // ease toward the pointer position (state.pointer is -1 to 1)
    group.current.rotation.y += (state.pointer.x * 0.25 - group.current.rotation.y) * Math.min(1, delta * 3);
    group.current.rotation.x += (-state.pointer.y * 0.15 - group.current.rotation.x) * Math.min(1, delta * 3);
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <Rig>
        {BLOCKS.map((b, i) => <Block key={i} {...b} />)}
      </Rig>
    </Canvas>
  );
}
```

Enhancements for later: a drop-in entrance (animate each block's `position.y` from above with a spring on mount), and letters on the blocks using drei `Text` with a **local** font file (avoid runtime font downloads).

### 11.7 Product 3D viewer (outline)

```jsx
"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ProductViewer({ url }) {
  return (
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ fov: 35 }}>
      <Stage environment={null} intensity={1} adjustCamera>
        <Model url={url} />
      </Stage>
      <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={6} />
    </Canvas>
  );
}
```

Load it with `dynamic(..., { ssr: false })` and mount it only when the person taps the "3D" tab in the gallery. Add a hint: "Drag to turn".

### 11.8 Cart add animation (outline)

1. On "Add", read the product image's bounding rect and the cart icon's bounding rect.
2. Render a clone of the image (`position: fixed`) with `motion.div` animating `x, y, scale, opacity` from the first rect to the second.
3. When it lands, bounce the cart badge and open the cart drawer (or show a toast on mobile).

---

## 12. Ease of use: the 4-year-old test

### 12.1 UI rules

- Tap targets at least **48px** (56px for primary actions) with at least 8px space between them.
- Icon **and** word together, never word-only.
- One main action per screen, always the biggest and most colorful thing.
- Max **three taps** from the homepage to "Add to cart".
- No hover-only features. No tiny close buttons. No drag-only interactions without a tap alternative.
- Every list has a clear empty state with a next step.

### 12.2 Child flow vs parent flow

```
Child (picture browsing)               Parent (paying)
1. Tap a picture tile                  1. Open cart or the shared wishlist
2. Tap a toy                           2. Check items and quantities
3. Tap the big Add button              3. Fill name, phone, city, address
4. Tap the heart to remember it        4. Choose payment (Cash on delivery)
5. Tap "Send to Mom/Dad"               5. Tap "Place order"
```

### 12.3 "Send to Mom/Dad" wishlist

A child hearts toys. A big button then shares the list through WhatsApp:

```js
const text = encodeURIComponent(
  `Please look at these toys on Masti Mall:\n${items.map(i => `${i.title}: https://mastimall.pk/${i.url}`).join("\n")}`
);
window.open(`https://wa.me/?text=${text}`, "_blank");
```

Replace the domain with your real one. The parent opens the links, adds to cart, and orders. This keeps real purchases with adults.

### 12.4 Checkout rules

- Guest checkout. No forced signup.
- Fields: name, phone, city, address, optional notes. Nothing else.
- Phone validation: `^03\d{9}$` (accept spaces or a dash and normalize).
- City as a searchable list of major cities, plus "Other".
- Remember the details on the device for the next order.
- Show total (with shipping) **before** the final button. No surprises.
- Inline error messages that say how to fix the problem.

### 12.5 Search

Large search field, suggestions as you type with product pictures, "No results" screen showing popular categories. Voice search is a possible later addition.
