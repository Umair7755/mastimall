import { Department } from "../models/Department.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { MallSetting } from "../models/Setting.js";

const DECOR_FILTERS = [
  { key: "price", label: "Price", type: "range", max: 15000 },
  { key: "brand", label: "Brand", type: "select", options: [] },
  { key: "inStock", label: "In stock only", type: "toggle" },
  { key: "onSale", label: "On sale", type: "toggle" },
];

const DECOR_CATEGORIES = [
  {
    slug: "wall-art",
    name: "Wall art",
    color: "#EDE9FE",
    order: 1,
    seo: {
      title: "Wall art",
      description: "Prints, canvases and gallery walls for every room.",
      intro: "Colour for blank walls — soft, bold, or kids-room bright.",
    },
  },
  {
    slug: "cushions-throws",
    name: "Cushions & throws",
    color: "#FCE7F3",
    order: 2,
    seo: {
      title: "Cushions and throws",
      description: "Soft layers for sofas and beds.",
      intro: "Texture and colour you can rearrange in a minute.",
    },
  },
  {
    slug: "lamps-lighting",
    name: "Lamps & lighting",
    color: "#FEF3C7",
    order: 3,
    seo: {
      title: "Lamps and lighting",
      description: "Warm light for evenings at home.",
      intro: "Table lamps and soft glow for living rooms and bedrooms.",
    },
  },
  {
    slug: "vases-planters",
    name: "Vases & planters",
    color: "#D1FAE5",
    order: 4,
    seo: {
      title: "Vases and planters",
      description: "Shapes for flowers and leafy corners.",
      intro: "Ceramic and woven pieces that look good empty or full.",
    },
  },
  {
    slug: "frames-mirrors",
    name: "Frames & mirrors",
    color: "#E0E7FF",
    order: 5,
    seo: {
      title: "Frames and mirrors",
      description: "Finish a wall or bounce more light.",
      intro: "Clean frames and mirrors sized for Pakistani apartments.",
    },
  },
  {
    slug: "table-decor",
    name: "Table décor",
    color: "#FFEDD5",
    order: 6,
    seo: {
      title: "Table décor",
      description: "Trays, candles and centrepieces.",
      intro: "Small pieces that make a dining table feel finished.",
    },
  },
];

const DECOR_PRODUCTS = [
  {
    slug: "sunset-canvas-set",
    title: "Sunset canvas trio",
    category: "wall-art",
    price: 4490,
    salePrice: 3890,
    stock: 16,
    brand: "Nestline",
    isNew: true,
    isFeatured: true,
    room: "living",
    highlights: ["Set of 3 canvases", "Ready to hang", "Fade-resistant print"],
    description: "Three warm sunset canvases sized for a sofa wall. Lightweight frames, ready to hang with the kit included.",
    tags: ["decor", "wall-art", "living", "canvas"],
  },
  {
    slug: "kids-alphabet-wall-print",
    title: "Kids alphabet wall print",
    category: "wall-art",
    price: 1890,
    stock: 24,
    brand: "Nestline",
    isNew: true,
    room: "kids-room",
    highlights: ["Soft pastel colours", "A3 size", "Matte finish"],
    description: "A cheerful alphabet print for nurseries and kids’ rooms. Matte paper that keeps colours calm on the wall.",
    tags: ["decor", "wall-art", "kids-room", "print"],
  },
  {
    slug: "cloud-cushion-pair",
    title: "Cloud cushion pair",
    category: "cushions-throws",
    price: 2590,
    salePrice: 2190,
    stock: 20,
    brand: "SoftHaus",
    isFeatured: true,
    room: "bedroom",
    highlights: ["Pair of cushions", "Removable covers", "Machine wash soft"],
    description: "Two plush cloud cushions with removable covers. Soft enough for a kids’ bed, pretty enough for the lounge.",
    tags: ["decor", "cushion", "bedroom", "kids-room"],
  },
  {
    slug: "linen-throw-blanket",
    title: "Linen throw blanket",
    category: "cushions-throws",
    price: 3290,
    stock: 12,
    brand: "SoftHaus",
    isNew: true,
    room: "living",
    highlights: ["Breathable weave", "Generous size", "Neutral sand tone"],
    description: "A sand-toned throw for sofas and reading chairs. Light enough for Karachi evenings, cosy for Lahore winters.",
    tags: ["decor", "throw", "living", "bedroom"],
  },
  {
    slug: "glow-dome-table-lamp",
    title: "Glow dome table lamp",
    category: "lamps-lighting",
    price: 3990,
    salePrice: 3490,
    stock: 10,
    brand: "Lumen & Co",
    isFeatured: true,
    isNew: true,
    room: "bedroom",
    highlights: ["Warm LED bulb included", "Touch dimmer", "Stable ceramic base"],
    description: "A dome lamp with a soft warm glow and touch dimmer. Looks calm on a bedside table or console.",
    tags: ["decor", "lamp", "bedroom", "living"],
  },
  {
    slug: "arc-desk-lamp",
    title: "Arc desk lamp",
    category: "lamps-lighting",
    price: 2890,
    stock: 14,
    brand: "Lumen & Co",
    room: "office",
    highlights: ["Adjustable head", "USB-C powered", "Matte black finish"],
    description: "A compact arc lamp for study tables and work-from-home desks. Clean light without a harsh glare.",
    tags: ["decor", "lamp", "office"],
  },
  {
    slug: "clay-curve-vase",
    title: "Clay curve vase",
    category: "vases-planters",
    price: 1790,
    stock: 18,
    brand: "Terra Form",
    isNew: true,
    room: "dining",
    highlights: ["Handmade look", "Watertight", "Works with or without flowers"],
    description: "A curved clay vase that stands alone as sculpture or holds a short bouquet on the dining table.",
    tags: ["decor", "vase", "dining", "living"],
  },
  {
    slug: "woven-planter-basket",
    title: "Woven planter basket",
    category: "vases-planters",
    price: 2190,
    salePrice: 1890,
    stock: 15,
    brand: "Terra Form",
    isFeatured: true,
    room: "living",
    highlights: ["Natural weave", "Removable liner", "Floor or shelf size"],
    description: "A woven basket with liner for leafy plants. Softens corners of living rooms and balconies.",
    tags: ["decor", "planter", "living"],
  },
  {
    slug: "slim-gallery-frame-set",
    title: "Slim gallery frame set",
    category: "frames-mirrors",
    price: 2490,
    stock: 22,
    brand: "Nestline",
    isNew: true,
    room: "living",
    highlights: ["Set of 4 frames", "Mixed sizes", "Wall template included"],
    description: "Four slim black frames with a simple gallery layout guide. Easy weekend wall project.",
    tags: ["decor", "frames", "living", "bedroom"],
  },
  {
    slug: "round-accent-mirror",
    title: "Round accent mirror",
    category: "frames-mirrors",
    price: 4590,
    salePrice: 3990,
    stock: 9,
    brand: "Nestline",
    isFeatured: true,
    room: "bedroom",
    highlights: ["50 cm diameter", "Metal rim", "Ready to hang"],
    description: "A round mirror that brightens tight bedrooms and entryways. Smooth metal rim, secure hanging kit.",
    tags: ["decor", "mirror", "bedroom", "living"],
  },
  {
    slug: "brass-tray-candle-set",
    title: "Brass tray candle set",
    category: "table-decor",
    price: 2690,
    stock: 17,
    brand: "Glow Ritual",
    isNew: true,
    isFeatured: true,
    room: "dining",
    highlights: ["Tray + 2 candles", "Unscented wax", "Gift-ready box"],
    description: "A brass tray with two unscented candles for dining tables and consoles. Looks finished even before you light them.",
    tags: ["decor", "table", "dining", "living"],
  },
  {
    slug: "marble-coaster-quartet",
    title: "Marble coaster quartet",
    category: "table-decor",
    price: 1490,
    stock: 30,
    brand: "Glow Ritual",
    room: "living",
    highlights: ["Set of 4", "Cork backed", "Real marble feel"],
    description: "Four cork-backed coasters with a marble look. Protects tables without looking like plastic.",
    tags: ["decor", "table", "living", "dining"],
  },
];

function artUrl(slug) {
  return `/art/decor/${slug}.svg`;
}

/**
 * Ensures Decor department + categories exist.
 * Sample products are seeded ONLY when the department is first created —
 * so admin deletes are not recreated on every server boot.
 */
export async function ensureDecorCatalog() {
  let department = await Department.findOne({ slug: "decor" });
  let isNewDepartment = false;
  if (!department) {
    department = await Department.create({
      name: "Decor",
      slug: "decor",
      themeKey: "decor",
      order: 2,
      active: true,
      banner: { url: "/art/decor/wall-art.svg", alt: "Home décor" },
      seo: {
        title: "Home décor",
        description: "Wall art, lighting, cushions and table pieces for a warmer home.",
      },
    });
    isNewDepartment = true;
    console.log("Decor department created");
  } else if (!department.active) {
    department.active = true;
    await department.save();
  }

  const categoryDocs = {};
  for (const category of DECOR_CATEGORIES) {
    let doc = await Category.findOne({ department: department._id, slug: category.slug });
    if (!doc) {
      doc = await Category.create({
        ...category,
        department: department._id,
        image: { url: `/art/decor/cat-${category.slug}.svg`, alt: category.name },
        filters: DECOR_FILTERS,
        active: true,
      });
    }
    categoryDocs[category.slug] = doc;
  }

  let created = 0;
  if (isNewDepartment) {
    for (const product of DECOR_PRODUCTS) {
      const exists = await Product.findOne({ slug: product.slug }).select("_id");
      if (exists) continue;
      const category = categoryDocs[product.category];
      if (!category) continue;
      await Product.create({
        title: product.title,
        slug: product.slug,
        sku: `MM-D-${product.slug}`.slice(0, 32).toUpperCase(),
        description: product.description,
        highlights: product.highlights,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        images: [
          { url: artUrl(product.slug), alt: product.title },
          { url: artUrl(`${product.slug}-alt`), alt: `${product.title}, detail` },
        ],
        department: department._id,
        category: category._id,
        audience: ["unisex"],
        ageBands: [],
        brand: product.brand,
        tags: product.tags,
        newlyAdded: !!product.isNew,
        isFeatured: !!product.isFeatured,
        status: "active",
        ratingAvg: 4.6,
        ratingCount: 8,
        seo: {
          title: product.title,
          description: product.description.slice(0, 150),
        },
      });
      created += 1;
    }
  }

  // Enable Decor in stored home nav when present.
  const home = await MallSetting.findOne({ key: "home" });
  if (home?.value?.nav) {
    const nav = home.value.nav.map((item) => {
      const label = String(item.label || "").toLowerCase();
      if (label.includes("decor") || label.includes("décor")) {
        return { ...item, href: "/decor", soon: false, kind: "department" };
      }
      return item;
    });
    const hasDecor = nav.some((item) => String(item.href || "").includes("/decor"));
    if (!hasDecor) {
      const toysIndex = nav.findIndex((item) => String(item.href || "").includes("/toys"));
      nav.splice(toysIndex >= 0 ? toysIndex + 1 : 1, 0, {
        label: "Decor",
        href: "/decor",
        kind: "department",
      });
    }
    home.value = { ...home.value, nav };
    home.markModified("value");
    await home.save();
  }

  if (created) console.log(`Decor catalog ready (+${created} products)`);
  return { departmentId: String(department._id), created };
}
