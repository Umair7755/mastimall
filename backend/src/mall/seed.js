import 'dotenv/config';
import mongoose from 'mongoose';
import { assertEnv, env } from '../config/env.js';
import { Department } from './models/Department.js';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { MallSetting } from './models/Setting.js';
import { Review } from './models/Review.js';
import { MallCustomer } from './models/MallCustomer.js';
import bcrypt from 'bcryptjs';
import { DEFAULT_SALE_BANNER } from './lib/saleBanner.js';

const FILTERS = [
  { key: 'ageBands', label: 'Age', type: 'chips', options: ['0-1', '1-3', '3-6', '6-12', '12-plus'] },
  { key: 'audience', label: 'For', type: 'chips', options: ['baby', 'boys', 'girls', 'unisex'] },
  { key: 'price', label: 'Price', type: 'range', max: 10000 },
  { key: 'brand', label: 'Brand', type: 'select', options: [] },
  { key: 'inStock', label: 'In stock only', type: 'toggle' },
  { key: 'onSale', label: 'On sale', type: 'toggle' },
];

const categories = [
  {
    slug: 'remote-control',
    name: 'Remote control',
    color: '#E0E7FF',
    order: 1,
    seo: {
      title: 'Remote control toys',
      description: 'Cars, diggers and helicopters you steer from the sofa.',
      intro: 'Big buttons, chunky remotes, and toys that actually move.',
    },
  },
  {
    slug: 'vehicles-and-ride-ons',
    name: 'Vehicles and ride-ons',
    color: '#FEF3C7',
    order: 2,
    seo: {
      title: 'Vehicles and ride-ons',
      description: 'Die-cast cars, wooden trains and first ride-ons.',
      intro: 'From pocket cars to the first bike without pedals.',
    },
  },
  {
    slug: 'baby-toys',
    name: 'Baby toys',
    color: '#FCE7F3',
    order: 3,
    seo: {
      title: 'Baby toys',
      description: 'Rattles, teethers and soft books for the first year.',
      intro: 'Easy to hold, easy to wash, made for little hands.',
    },
  },
  {
    slug: 'dolls-and-pretend-play',
    name: 'Dolls and pretend play',
    color: '#FDE68A',
    order: 4,
    seo: {
      title: 'Dolls and pretend play',
      description: 'Dolls, kitchens and doctor kits for everyday stories.',
      intro: 'Toys for looking after someone, cooking, and playing house.',
    },
  },
  {
    slug: 'building-and-puzzles',
    name: 'Building and puzzles',
    color: '#D1FAE5',
    order: 5,
    seo: {
      title: 'Building and puzzles',
      description: 'Blocks, floor puzzles and magnetic tiles.',
      intro: 'Stack it, snap it, or solve it on the floor.',
    },
  },
  {
    slug: 'learning-and-creative',
    name: 'Learning and creative',
    color: '#E0F2FE',
    order: 6,
    seo: {
      title: 'Learning and creative toys',
      description: 'Art sets, writing tablets and a first science box.',
      intro: 'Make a mess with a purpose. Paint, write, and try a small experiment.',
    },
  },
  {
    slug: 'outdoor-and-water-play',
    name: 'Outdoor and water play',
    color: '#CFFAFE',
    order: 7,
    seo: {
      title: 'Outdoor and water play',
      description: 'Bubbles and a garden swing for the courtyard.',
      intro: 'Toys that belong outside, on a balcony or in the yard.',
    },
  },
  {
    slug: 'games-and-fun',
    name: 'Games and fun',
    color: '#EDE9FE',
    order: 8,
    seo: {
      title: 'Games and fun',
      description: 'Board games and cards for family evenings.',
      intro: 'Short games you can finish before dinner gets cold.',
    },
  },
  {
    slug: 'soft-toys',
    name: 'Soft toys',
    color: '#FFE4E6',
    order: 9,
    seo: {
      title: 'Soft toys',
      description: 'Huggable plush for bedtime and the car seat.',
      intro: 'Soft enough to sleep with, sturdy enough for the washing machine.',
    },
  },
  {
    slug: 'gift-ideas',
    name: 'Gift ideas',
    color: '#FEF9C3',
    order: 10,
    seo: {
      title: 'Gift ideas',
      description: 'Ready-to-give boxes when you need a present today.',
      intro: 'One box, a few surprises, wrapped and ready.',
    },
  },
];

const products = [
  {
    slug: 'rc-rally-buggy',
    title: 'RC rally buggy',
    category: 'remote-control',
    price: 3490,
    salePrice: 2990,
    stock: 14,
    brand: 'Roadly',
    audience: ['boys', 'unisex'],
    ageBands: ['6-12', '12-plus'],
    isNew: true,
    isFeatured: true,
    ratingAvg: 4.7,
    ratingCount: 18,
    fragile: false,
    weightGrams: 680,
    motif: 'car',
    highlights: ['Steers left and right from the remote', 'Soft tires for tile and carpet', 'Recharges from a USB cable'],
    description:
      'A chunky rally buggy for the hallway and the courtyard. The remote has two large sticks, so a child can drive without hunting for tiny buttons. It comes with a USB charging cable.',
    tags: ['remote', 'car', 'buggy'],
  },
  {
    slug: 'rc-sky-hopper',
    title: 'RC sky hopper',
    category: 'remote-control',
    price: 4290,
    stock: 8,
    brand: 'Roadly',
    audience: ['boys', 'unisex'],
    ageBands: ['6-12'],
    isNew: true,
    ratingAvg: 4.4,
    ratingCount: 9,
    weightGrams: 240,
    motif: 'heli',
    highlights: ['Stable indoor hover', 'One-button lift off', 'Spare rotor in the box'],
    description:
      'A small helicopter that stays in the room. It lifts with one button and drifts slowly enough for a first flight in a clear living room.',
    tags: ['remote', 'helicopter'],
  },
  {
    slug: 'rc-digger-truck',
    title: 'RC digger truck',
    category: 'remote-control',
    price: 3890,
    salePrice: 3490,
    stock: 11,
    brand: 'Roadly',
    audience: ['boys'],
    ageBands: ['3-6', '6-12'],
    isFeatured: true,
    ratingAvg: 4.6,
    ratingCount: 15,
    weightGrams: 920,
    motif: 'truck',
    highlights: ['Arm lifts and dumps', 'Works on carpet', 'Remote stores in the cab'],
    description:
      'A digger that drives and dumps. The arm is worked from the same remote, and the bucket is big enough for wooden blocks.',
    tags: ['remote', 'truck', 'digger'],
  },
  {
    slug: 'city-car-five-pack',
    title: 'City car five pack',
    category: 'vehicles-and-ride-ons',
    price: 1450,
    stock: 22,
    brand: 'Roadly',
    audience: ['unisex', 'boys'],
    ageBands: ['3-6', '6-12'],
    isNew: true,
    ratingAvg: 4.5,
    ratingCount: 21,
    weightGrams: 410,
    motif: 'cars',
    highlights: ['Five die-cast cars', 'Doors that open', 'Small enough for a pocket'],
    description:
      'Five sturdy little cars: a taxi, a bus, a police car, a pickup and a racer. Doors open. They survive being dropped on tile.',
    tags: ['die-cast', 'cars'],
  },
  {
    slug: 'first-balance-bike',
    title: 'First balance bike',
    category: 'vehicles-and-ride-ons',
    price: 5490,
    stock: 6,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['1-3', '3-6'],
    isFeatured: true,
    ratingAvg: 4.8,
    ratingCount: 12,
    weightGrams: 2800,
    motif: 'bike',
    highlights: ['No pedals to tangle', 'Soft seat', 'Height adjusts as they grow'],
    description:
      'A first bike with no pedals. Feet stay on the ground, so a toddler learns balance before they learn to pedal. The seat moves up as they grow.',
    tags: ['ride-on', 'bike'],
  },
  {
    slug: 'wooden-train-loop',
    title: 'Wooden train loop',
    category: 'vehicles-and-ride-ons',
    price: 2750,
    salePrice: 2490,
    stock: 10,
    brand: 'Blocko',
    audience: ['unisex'],
    ageBands: ['1-3', '3-6'],
    isFeatured: true,
    ratingAvg: 4.9,
    ratingCount: 27,
    weightGrams: 1100,
    motif: 'train',
    highlights: ['24 wooden pieces', 'A bridge and a station', 'Fits standard wooden track'],
    description:
      'A closed wooden loop with a bridge, a station and a train of three carriages. Pieces are sanded smooth and painted with water-based colour.',
    tags: ['train', 'wood'],
  },
  {
    slug: 'soft-rattle-trio',
    title: 'Soft rattle trio',
    category: 'baby-toys',
    price: 890,
    stock: 30,
    brand: 'Snug',
    audience: ['baby'],
    ageBands: ['0-1'],
    isNew: true,
    ratingAvg: 4.6,
    ratingCount: 14,
    weightGrams: 180,
    motif: 'rattle',
    highlights: ['Three easy grips', 'Soft sound, not a shriek', 'Machine washable cover'],
    description:
      'Three small rattles in different shapes so a baby can find the grip they like. The sound is a soft shake, not a piercing bell.',
    tags: ['baby', 'rattle'],
  },
  {
    slug: 'teether-keys',
    title: 'Teether keys',
    category: 'baby-toys',
    price: 650,
    stock: 28,
    brand: 'Snug',
    audience: ['baby'],
    ageBands: ['0-1'],
    ratingAvg: 4.5,
    ratingCount: 11,
    weightGrams: 90,
    motif: 'teether',
    highlights: ['Food-grade silicone', 'Cold-chew friendly', 'Clip for the stroller'],
    description:
      'A ring of silicone keys for sore gums. Chill them in the fridge. The clip hangs from a stroller or a car seat strap.',
    tags: ['baby', 'teether'],
  },
  {
    slug: 'cloth-garden-book',
    title: 'Cloth garden book',
    category: 'baby-toys',
    price: 1200,
    stock: 16,
    brand: 'Snug',
    audience: ['baby', 'unisex'],
    ageBands: ['0-1', '1-3'],
    isFeatured: true,
    ratingAvg: 4.7,
    ratingCount: 19,
    weightGrams: 220,
    motif: 'book',
    highlights: ['Six cloth pages', 'A crinkle and a squeaker', 'Washes cold'],
    description:
      'A soft book about a garden. Pages crinkle, a bird squeaks, and the whole book can go in a cold wash.',
    tags: ['baby', 'book'],
  },
  {
    slug: 'doll-and-carry-cot',
    title: 'Doll and carry cot',
    category: 'dolls-and-pretend-play',
    price: 3200,
    salePrice: 2890,
    stock: 9,
    brand: 'Snug',
    audience: ['girls'],
    ageBands: ['3-6', '6-12'],
    isNew: true,
    ratingAvg: 4.8,
    ratingCount: 16,
    weightGrams: 740,
    motif: 'doll',
    highlights: ['Soft body doll', 'Cot with a handle', 'Two outfits'],
    description:
      'A soft doll that fits in a small carry cot. Two outfits are included. Hair is stitched, so there is nothing to pull out.',
    tags: ['doll', 'pretend'],
  },
  {
    slug: 'mini-kitchen-set',
    title: 'Mini kitchen set',
    category: 'dolls-and-pretend-play',
    price: 4100,
    stock: 7,
    brand: 'Playwell',
    audience: ['girls', 'unisex'],
    ageBands: ['3-6', '6-12'],
    isFeatured: true,
    ratingAvg: 4.6,
    ratingCount: 13,
    weightGrams: 2400,
    motif: 'kitchen',
    highlights: ['Click knobs that turn', 'A pan and two cups', 'Stands on its own'],
    description:
      'A tabletop kitchen with knobs that click, a door that shuts, and a pan that lives on the hob. It stands on the floor without a wall.',
    tags: ['kitchen', 'pretend'],
  },
  {
    slug: 'doctor-visit-kit',
    title: 'Doctor visit kit',
    category: 'dolls-and-pretend-play',
    price: 1850,
    stock: 18,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['3-6'],
    isNew: true,
    ratingAvg: 4.4,
    ratingCount: 8,
    weightGrams: 480,
    motif: 'doctor',
    highlights: ['Eight play tools', 'A soft bag', 'No small batteries'],
    description:
      'A doctor bag with a play stethoscope, thermometer, syringe and bandage. Nothing beeps and nothing needs a battery.',
    tags: ['doctor', 'pretend'],
  },
  {
    slug: 'jumbo-blocks-60',
    title: 'Jumbo blocks, 60 pieces',
    category: 'building-and-puzzles',
    price: 1650,
    stock: 20,
    brand: 'Blocko',
    audience: ['unisex'],
    ageBands: ['1-3', '3-6'],
    isFeatured: true,
    isNew: true,
    ratingAvg: 4.9,
    ratingCount: 33,
    weightGrams: 980,
    motif: 'blocks',
    highlights: ['60 big blocks', 'A storage bag', 'Bright, solid colours'],
    description:
      'Sixty large blocks in a drawstring bag. They are big enough that a one-year-old can stack them, and heavy enough to stay put.',
    tags: ['blocks', 'building'],
  },
  {
    slug: 'animal-floor-puzzle',
    title: 'Animal floor puzzle',
    category: 'building-and-puzzles',
    price: 980,
    stock: 24,
    brand: 'Blocko',
    audience: ['unisex'],
    ageBands: ['1-3', '3-6'],
    ratingAvg: 4.5,
    ratingCount: 17,
    weightGrams: 520,
    motif: 'puzzle',
    highlights: ['12 chunky pieces', 'A farm scene', 'Wipes clean'],
    description:
      'Twelve thick pieces that make a farm. Each piece is large, with a little knob, so small hands can lift them.',
    tags: ['puzzle'],
  },
  {
    slug: 'magnetic-tile-starter',
    title: 'Magnetic tile starter',
    category: 'building-and-puzzles',
    price: 5200,
    salePrice: 4690,
    stock: 8,
    brand: 'Blocko',
    audience: ['unisex'],
    ageBands: ['3-6', '6-12'],
    isFeatured: true,
    ratingAvg: 4.8,
    ratingCount: 22,
    fragile: true,
    weightGrams: 1400,
    motif: 'tiles',
    highlights: ['32 tiles', 'Squares and triangles', 'Clear colour, strong magnets'],
    description:
      'Thirty-two magnetic tiles for houses, rockets and flat patterns. The magnets sit inside the plastic, and the box includes a simple idea card.',
    tags: ['magnetic', 'building'],
  },
  {
    slug: 'kitchen-science-box',
    title: 'Kitchen science box',
    category: 'learning-and-creative',
    price: 2400,
    stock: 12,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['6-12'],
    isNew: true,
    ratingAvg: 4.6,
    ratingCount: 10,
    weightGrams: 860,
    motif: 'science',
    highlights: ['Six experiments', 'Uses kitchen ingredients', 'A grown-up card in each pack'],
    description:
      'Six short experiments that use things you already have: vinegar, baking soda, oil and food colour. Each card says when a grown-up should help.',
    tags: ['science', 'learning'],
  },
  {
    slug: 'art-caddy-24',
    title: 'Art caddy, 24 colours',
    category: 'learning-and-creative',
    price: 1350,
    stock: 19,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['3-6', '6-12'],
    ratingAvg: 4.3,
    ratingCount: 7,
    weightGrams: 640,
    motif: 'art',
    highlights: ['24 washable markers', 'A paper pad', 'A caddy that stands up'],
    description:
      'Washable markers in a caddy that sits on the table, plus a pad of paper. Colour comes off skin with soap. Give the table a cover anyway.',
    tags: ['art', 'drawing'],
  },
  {
    slug: 'lcd-writing-tablet',
    title: 'LCD writing tablet',
    category: 'learning-and-creative',
    price: 1490,
    salePrice: 1190,
    stock: 15,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['3-6', '6-12'],
    isNew: true,
    ratingAvg: 4.4,
    ratingCount: 20,
    weightGrams: 260,
    motif: 'tablet',
    highlights: ['No paper to replace', 'One button clears the screen', 'Stylus stores on the side'],
    description:
      'A writing tablet for letters and doodles. Press the button and the screen clears. The stylus clicks into the frame so it does not walk off.',
    tags: ['writing', 'tablet'],
  },
  {
    slug: 'bubble-wand-pack',
    title: 'Bubble wand party pack',
    category: 'outdoor-and-water-play',
    price: 750,
    stock: 26,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['1-3', '3-6', '6-12'],
    ratingAvg: 4.2,
    ratingCount: 9,
    weightGrams: 300,
    motif: 'bubbles',
    highlights: ['Four wands', 'A bottle of mix', 'Works in a light breeze'],
    description:
      'Four bubble wands and a bottle of mix for the courtyard. The largest wand makes bubbles a child can chase.',
    tags: ['bubbles', 'outdoor'],
  },
  {
    slug: 'garden-swing-seat',
    title: 'Garden swing seat',
    category: 'outdoor-and-water-play',
    price: 6800,
    stock: 4,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['3-6', '6-12'],
    isFeatured: true,
    ratingAvg: 4.7,
    ratingCount: 6,
    weightGrams: 1800,
    motif: 'swing',
    highlights: ['High back and a front bar', 'Rope for a beam or a frame', 'Holds up to 40 kg'],
    description:
      'A swing seat with a high back and a front bar. Hang it from a strong beam or a frame you already trust. It is for one child at a time.',
    tags: ['swing', 'outdoor'],
  },
  {
    slug: 'snakes-and-ladders',
    title: 'Snakes and ladders',
    category: 'games-and-fun',
    price: 690,
    stock: 32,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['3-6', '6-12'],
    ratingAvg: 4.6,
    ratingCount: 25,
    weightGrams: 340,
    motif: 'board',
    highlights: ['Folding board', 'Four counters', 'A short rules card'],
    description:
      'The classic race, with a board that folds into the box. Good for two to four players and about twenty minutes.',
    tags: ['board game'],
  },
  {
    slug: 'family-card-game',
    title: 'Family card game',
    category: 'games-and-fun',
    price: 890,
    stock: 21,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['6-12', '12-plus'],
    ratingAvg: 4.5,
    ratingCount: 11,
    weightGrams: 200,
    motif: 'cards',
    highlights: ['Three short games', 'Large print', 'Plays in ten minutes'],
    description:
      'One deck, three games, all written in plain language. The print is large. A round fits into a tea break.',
    tags: ['cards', 'family'],
  },
  {
    slug: 'strategy-duel-cards',
    title: 'Strategy duel cards',
    category: 'games-and-fun',
    price: 1290,
    stock: 13,
    brand: 'Playwell',
    audience: ['unisex'],
    ageBands: ['12-plus'],
    ratingAvg: 4.3,
    ratingCount: 5,
    weightGrams: 220,
    motif: 'duel',
    highlights: ['For ages 12 and up', 'Two-player tactics', 'About twenty minutes'],
    description:
      'A two-player card game about building a small city and blocking your rival. The rules assume a reader who is at least 12. It stays in this category and out of the younger age pages.',
    tags: ['cards', 'strategy', '12-plus'],
  },
  {
    slug: 'hug-bear-40',
    title: 'Hug bear, 40 cm',
    category: 'soft-toys',
    price: 1890,
    salePrice: 1590,
    stock: 17,
    brand: 'Snug',
    audience: ['unisex', 'baby'],
    ageBands: ['0-1', '1-3', '3-6'],
    isFeatured: true,
    isNew: true,
    ratingAvg: 4.9,
    ratingCount: 29,
    weightGrams: 320,
    motif: 'bear',
    highlights: ['40 cm tall', 'Embroidered face', 'Cold wash, gentle dry'],
    description:
      'A medium bear with an embroidered face, so there are no plastic eyes to worry about. Soft enough for a crib, and it survives a gentle wash.',
    tags: ['plush', 'bear'],
  },
  {
    slug: 'mystery-gift-box',
    title: 'Mystery gift box',
    category: 'gift-ideas',
    price: 1990,
    stock: 15,
    brand: 'Masti',
    audience: ['unisex'],
    ageBands: ['3-6', '6-12'],
    isNew: true,
    ratingAvg: 4.4,
    ratingCount: 8,
    weightGrams: 700,
    motif: 'gift',
    highlights: ['Three toys under Rs 2,000', 'Wrapped and ready', 'A note card inside'],
    description:
      'Three small toys picked to suit ages 3 to 12, packed in one wrapped box. You will not see the exact toys before it arrives. The total value stays at the price you pay.',
    tags: ['gift', 'bundle'],
  },
];

export async function seedCatalog() {
await Promise.all([
  Department.deleteMany({}),
  Category.deleteMany({}),
  Product.deleteMany({}),
  Review.deleteMany({}),
  MallSetting.deleteMany({ key: { $in: ['home', 'orderSeq'] } }),
]);

const department = await Department.create({
  name: 'Toys',
  slug: 'toys',
  themeKey: 'toys',
  order: 1,
  active: true,
  banner: { url: '/art/cat-remote-control.svg', alt: 'A remote control car' },
  seo: {
    title: 'Toys',
    description: 'Find a toy by who it is for, how old they are, or what you want to spend.',
  },
});

const categoryDocs = {};
for (const category of categories) {
  categoryDocs[category.slug] = await Category.create({
    ...category,
    department: department._id,
    image: { url: `/art/cat-${category.slug}.svg`, alt: category.name },
    filters: FILTERS,
    active: true,
  });
}

const REVIEW_POOL = [
  { name: 'Ayesha K.', city: 'Lahore', title: 'Kids loved it', text: 'Came quickly and my kids played with it the same evening. Soft packing too.' },
  { name: 'Hassan R.', city: 'Karachi', title: 'Worth the price', text: 'Really solid quality for the money. Would buy again for cousins.' },
  { name: 'Fatima S.', city: 'Islamabad', title: 'Perfect gift', text: 'Bought this for my niece and she smiled so big. Easy to open and use.' },
  { name: 'Omar B.', city: 'Rawalpindi', title: 'Happy little one', text: 'Good size, bright colours, and no sharp edges. Feels safe for home play.' },
  { name: 'Sana M.', city: 'Faisalabad', title: 'As pictured', text: 'Looks just like the photos. Delivery was smooth and packing was careful.' },
  { name: 'Bilal A.', city: 'Multan', title: 'Fun for the whole family', text: 'We played together after dinner. Simple instructions and lots of smiles.' },
  { name: 'Zara H.', city: 'Peshawar', title: 'Recommend', text: 'Cute toy and good value. My son keeps asking for it every morning.' },
  { name: 'Usman T.', city: 'Hyderabad', title: 'Great buy', text: 'Arrived on time. Build quality is nicer than I expected at this price.' },
];

const productDocs = [];
for (const product of products) {
  const category = categoryDocs[product.category];
  const created = await Product.create({
    title: product.title,
    slug: product.slug,
    sku: `MM-${product.slug}`.slice(0, 32).toUpperCase(),
    description: product.description,
    highlights: product.highlights,
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
    images: [
      { url: `/art/${product.slug}.svg`, alt: product.title },
      { url: `/art/${product.slug}-alt.svg`, alt: `${product.title}, another view` },
    ],
    department: department._id,
    category: category._id,
    audience: product.audience,
    ageBands: product.ageBands,
    brand: product.brand,
    tags: product.tags,
    weightGrams: product.weightGrams,
    fragile: !!product.fragile,
    newlyAdded: !!product.isNew,
    isFeatured: !!product.isFeatured,
    status: 'active',
    ratingAvg: 0,
    ratingCount: 0,
    seo: {
      title: product.title,
      description: product.description.slice(0, 150),
    },
  });
  productDocs.push(created);
}

for (const [index, product] of productDocs.entries()) {
  const reviewCount = 2 + (index % 3);
  let total = 0;
  for (let i = 0; i < reviewCount; i += 1) {
    const sample = REVIEW_POOL[(index + i) % REVIEW_POOL.length];
    const rating = Math.min(5, Math.max(4, 4 + ((index + i) % 2)));
    total += rating;
    await Review.create({
      product: product._id,
      name: sample.name,
      city: sample.city,
      title: sample.title,
      text: sample.text,
      rating,
    });
  }
  await Product.updateOne(
    { _id: product._id },
    { $set: { ratingAvg: Math.round((total / reviewCount) * 10) / 10, ratingCount: reviewCount } }
  );
}

await MallSetting.create({
  key: 'home',
  value: {
    announcement: 'Cash on delivery across Pakistan · Prices checked on our server.',
    whatsapp: '',
    nav: [
      { label: 'Home', href: '/', kind: 'home' },
      { label: 'Toys', href: '/toys', kind: 'department' },
      { label: 'Decor', href: '/decor', kind: 'department' },
      { label: 'Deals', href: '/search?onSale=1' },
      { label: 'New arrivals', href: '/search?sort=new' },
    ],
    sections: [
      {
        type: 'hero',
        title: 'Toys + décor. Full masti.',
        order: 0,
        active: true,
        config: {
          text: 'Bacchon ke toys aur ghar ka décor — dono ek jagah. Bas teen taps, asaan shopping.',
        },
      },
      {
        type: 'finder',
        title: 'Find toys',
        order: 1,
        active: true,
        config: { limits: [1000, 3000, 5000] },
      },
      {
        type: 'products',
        title: 'All toys',
        order: 2,
        active: true,
        config: { all: true, sort: 'new', limit: 24, layout: 'row' },
      },
      {
        type: 'products',
        title: 'Hot right now',
        order: 3,
        active: true,
        config: { sort: 'popular', featured: true, limit: 12, layout: 'row' },
      },
      {
        type: 'products',
        title: 'New arrivals',
        order: 4,
        active: true,
        config: { sort: 'new', isNew: true, limit: 12, layout: 'row' },
      },
      {
        type: 'trust',
        title: 'Why Masti Mall',
        order: 5,
        active: true,
        config: {
          points: [
            { title: 'Cash on delivery', text: 'Pay when the parcel arrives. It is selected for you at checkout.' },
            { title: 'Prices checked again', text: 'The total is added up on our server, from the live price and stock.' },
            { title: 'Free delivery from Rs 3,000', text: 'Under that, delivery is Rs 200 in the big cities and Rs 250 elsewhere.' },
            { title: 'No account needed', text: 'A name, a phone number, a city and an address. That is the whole checkout.' },
          ],
        },
      },
      { type: 'reviews', title: 'Kind words', order: 6, active: false, config: { items: [] } },
    ],
  },
});

await MallSetting.create({ key: 'orderSeq', value: { n: 0 } });

await MallSetting.create({
  key: 'saleBanner',
  value: {
    ...DEFAULT_SALE_BANNER,
    endsAt: new Date(new Date().getFullYear(), 10, 18, 23, 59, 59, 999).toISOString(),
  },
});

const adminEmail = (process.env.MALL_ADMIN_EMAIL || 'admin@mastimall.pk').toLowerCase();
const adminPassword = process.env.MALL_ADMIN_PASSWORD || 'Admin@12345';
await MallCustomer.create({
  name: 'Masti Admin',
  email: adminEmail,
  phone: '03001234567',
  passwordHash: await bcrypt.hash(adminPassword, 10),
  role: 'admin',
});

console.log(`Seeded Toys with ${categories.length} categories and ${products.length} products.`);
console.log(`Admin login: ${adminEmail} / (see MALL_ADMIN_PASSWORD or default Admin@12345)`);

  const { ensureDecorCatalog } = await import('./lib/ensureDecor.js');
  await ensureDecorCatalog();
}

const invokedDirectly = process.argv[1]?.endsWith('seed.js');
if (invokedDirectly) {
  assertEnv();
  await mongoose.connect(env.mongoUri);
  await seedCatalog();
  await mongoose.disconnect();
}
