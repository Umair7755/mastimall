import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public");
const ink = "#0F172A";
const brand = "#4F46E5";
const sun = "#FBBF24";
const coral = "#FB7185";
const green = "#22C55E";
const white = "#FFFFFF";
const sky = "#E0F2FE";

function svg(body, plate) {
  const backdrop = plate
    ? `<rect width="640" height="640" fill="#F6F3EC"/><ellipse cx="320" cy="530" rx="170" ry="22" fill="#E4DDD0"/>`
    : `<ellipse cx="320" cy="530" rx="150" ry="18" fill="#0F172A" opacity="0.08"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="none">${backdrop}${body}</svg>\n`;
}

function wheel(x, y, r = 28) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${ink}"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${white}"/>`;
}

const toys = {
  car: (accent) => `
    <rect x="150" y="250" width="340" height="120" rx="48" fill="${accent}"/>
    <rect x="210" y="190" width="180" height="90" rx="36" fill="${sun}"/>
    <rect x="230" y="208" width="64" height="48" rx="12" fill="${sky}"/>
    <rect x="308" y="208" width="64" height="48" rx="12" fill="${sky}"/>
    ${wheel(220, 370)} ${wheel(420, 370)}
  `,
  heli: (accent) => `
    <ellipse cx="330" cy="300" rx="120" ry="58" fill="${accent}"/>
    <rect x="430" y="280" width="90" height="22" rx="11" fill="${sun}"/>
    <rect x="150" y="210" width="300" height="16" rx="8" fill="${ink}"/>
    <circle cx="300" cy="218" r="10" fill="${coral}"/>
    <rect x="250" y="350" width="150" height="12" rx="6" fill="${ink}"/>
    <rect x="270" y="348" width="10" height="40" fill="${ink}"/>
    <rect x="370" y="348" width="10" height="40" fill="${ink}"/>
  `,
  truck: (accent) => `
    <rect x="120" y="250" width="250" height="130" rx="28" fill="${sun}"/>
    <rect x="340" y="290" width="170" height="90" rx="24" fill="${accent}"/>
    <rect x="370" y="230" width="70" height="50" rx="10" fill="${ink}"/>
    ${wheel(210, 390)} ${wheel(450, 390)}
  `,
  cars: (accent) => `
    <g transform="translate(40 40)">${toys.car(accent)}</g>
  `,
  bike: (accent) => `
    ${wheel(200, 390, 58)} ${wheel(430, 390, 58)}
    <path d="M200 390 L300 250 L390 390 L310 390 L270 310 Z" fill="${accent}"/>
    <rect x="250" y="230" width="90" height="22" rx="11" fill="${sun}"/>
    <rect x="360" y="250" width="16" height="90" rx="8" fill="${ink}"/>
  `,
  train: (accent) => `
    <rect x="120" y="250" width="180" height="140" rx="28" fill="${accent}"/>
    <rect x="150" y="190" width="90" height="70" rx="16" fill="${sun}"/>
    <rect x="310" y="280" width="200" height="110" rx="24" fill="${coral}"/>
    <circle cx="250" cy="220" r="16" fill="${ink}"/>
    ${wheel(180, 400, 24)} ${wheel(250, 400, 24)} ${wheel(370, 400, 24)} ${wheel(450, 400, 24)}
  `,
  rattle: (accent) => `
    <circle cx="250" cy="280" r="70" fill="${accent}"/>
    <circle cx="390" cy="250" r="48" fill="${sun}"/>
    <circle cx="360" cy="380" r="40" fill="${coral}"/>
    <rect x="300" y="300" width="18" height="90" rx="9" fill="${ink}"/>
  `,
  teether: (accent) => `
    <circle cx="320" cy="300" r="70" fill="none" stroke="${accent}" stroke-width="28"/>
    <rect x="250" y="250" width="36" height="90" rx="16" fill="${sun}" transform="rotate(-20 268 295)"/>
    <rect x="310" y="220" width="36" height="90" rx="16" fill="${coral}"/>
    <rect x="360" y="250" width="36" height="90" rx="16" fill="${green}" transform="rotate(18 378 295)"/>
  `,
  book: (accent) => `
    <path d="M120 180 H320 V470 H150 Q120 470 120 430 Z" fill="${accent}"/>
    <path d="M520 180 H320 V470 H490 Q520 470 520 430 Z" fill="${sun}"/>
    <path d="M150 230 H300 M150 280 H280 M340 230 H490 M340 280 H470" stroke="${white}" stroke-width="10" stroke-linecap="round"/>
  `,
  doll: (accent) => `
    <circle cx="320" cy="200" r="58" fill="#FDBA74"/>
    <circle cx="300" cy="194" r="6" fill="${ink}"/>
    <circle cx="340" cy="194" r="6" fill="${ink}"/>
    <path d="M304 220 Q320 234 336 220" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>
    <rect x="250" y="260" width="140" height="170" rx="50" fill="${accent}"/>
    <rect x="180" y="360" width="280" height="90" rx="28" fill="${sun}"/>
  `,
  kitchen: (accent) => `
    <rect x="160" y="180" width="320" height="280" rx="28" fill="${accent}"/>
    <rect x="190" y="220" width="260" height="16" rx="8" fill="${ink}"/>
    <circle cx="240" cy="290" r="22" fill="${sun}"/>
    <circle cx="320" cy="290" r="22" fill="${coral}"/>
    <circle cx="400" cy="290" r="22" fill="${green}"/>
    <rect x="210" y="340" width="220" height="80" rx="16" fill="${white}"/>
  `,
  doctor: (accent) => `
    <rect x="200" y="220" width="240" height="200" rx="36" fill="${accent}"/>
    <rect x="250" y="170" width="140" height="70" rx="20" fill="${sun}"/>
    <rect x="300" y="280" width="40" height="100" rx="10" fill="${white}"/>
    <rect x="270" y="310" width="100" height="40" rx="10" fill="${white}"/>
  `,
  blocks: () => `
    <rect x="150" y="300" width="120" height="120" rx="22" fill="${brand}" transform="rotate(-8 210 360)"/>
    <rect x="250" y="250" width="120" height="120" rx="22" fill="${sun}"/>
    <rect x="340" y="320" width="120" height="120" rx="22" fill="${coral}" transform="rotate(8 400 380)"/>
    <rect x="280" y="160" width="90" height="90" rx="18" fill="${green}"/>
  `,
  puzzle: (accent) => `
    <rect x="160" y="180" width="150" height="150" rx="24" fill="${accent}"/>
    <rect x="320" y="180" width="150" height="150" rx="24" fill="${sun}"/>
    <rect x="160" y="340" width="150" height="150" rx="24" fill="${coral}"/>
    <rect x="320" y="340" width="150" height="150" rx="24" fill="${green}"/>
    <circle cx="310" cy="255" r="22" fill="${white}"/>
  `,
  tiles: (accent) => `
    <polygon points="320,140 430,250 320,360 210,250" fill="${accent}"/>
    <polygon points="210,250 320,360 210,470 100,360" fill="${sun}"/>
    <polygon points="430,250 540,360 430,470 320,360" fill="${coral}"/>
  `,
  science: (accent) => `
    <path d="M280 140 H360 L340 280 H300 Z" fill="${sky}" stroke="${ink}" stroke-width="10"/>
    <path d="M250 280 H390 L420 470 Q320 530 200 470 Z" fill="${accent}"/>
    <circle cx="300" cy="400" r="16" fill="${white}"/>
    <circle cx="350" cy="430" r="10" fill="${sun}"/>
  `,
  art: (accent) => `
    <rect x="180" y="160" width="280" height="300" rx="28" fill="${accent}"/>
    <rect x="220" y="210" width="28" height="180" rx="14" fill="${coral}"/>
    <rect x="270" y="230" width="28" height="160" rx="14" fill="${sun}"/>
    <rect x="320" y="200" width="28" height="190" rx="14" fill="${green}"/>
    <rect x="370" y="240" width="28" height="150" rx="14" fill="${brand}"/>
  `,
  tablet: (accent) => `
    <rect x="140" y="160" width="320" height="320" rx="36" fill="${accent}"/>
    <rect x="170" y="190" width="260" height="240" rx="16" fill="${sky}"/>
    <path d="M200 300 C240 250 280 340 340 280" stroke="${ink}" stroke-width="10" stroke-linecap="round"/>
    <rect x="430" y="250" width="28" height="160" rx="14" fill="${sun}"/>
  `,
  bubbles: (accent) => `
    <circle cx="250" cy="250" r="70" fill="${accent}" opacity="0.9"/>
    <circle cx="390" cy="220" r="48" fill="${sun}"/>
    <circle cx="360" cy="360" r="80" fill="${coral}" opacity="0.85"/>
    <circle cx="230" cy="390" r="36" fill="${green}"/>
    <circle cx="270" cy="230" r="12" fill="${white}"/>
  `,
  swing: (accent) => `
    <path d="M180 120 L250 420 M460 120 L390 420" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>
    <rect x="210" y="390" width="220" height="70" rx="24" fill="${accent}"/>
    <rect x="230" y="330" width="180" height="80" rx="20" fill="${sun}"/>
  `,
  board: (accent) => `
    <rect x="150" y="140" width="340" height="360" rx="28" fill="${accent}"/>
    ${Array.from({ length: 16 }, (_, i) => {
      const x = 180 + (i % 4) * 72;
      const y = 180 + Math.floor(i / 4) * 72;
      const fill = (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? white : sun;
      return `<rect x="${x}" y="${y}" width="60" height="60" rx="8" fill="${fill}"/>`;
    }).join("")}
  `,
  cards: (accent) => `
    <rect x="170" y="160" width="200" height="280" rx="24" fill="${white}" stroke="${ink}" stroke-width="8" transform="rotate(-8 270 300)"/>
    <rect x="270" y="170" width="200" height="280" rx="24" fill="${accent}" transform="rotate(8 370 310)"/>
    <circle cx="370" cy="300" r="28" fill="${sun}"/>
  `,
  duel: (accent) => `
    <rect x="150" y="180" width="180" height="260" rx="22" fill="${accent}"/>
    <rect x="310" y="180" width="180" height="260" rx="22" fill="${ink}"/>
    <polygon points="240,250 252,286 290,286 260,308 272,344 240,322 208,344 220,308 190,286 228,286" fill="${sun}"/>
  `,
  bear: (accent) => `
    <circle cx="230" cy="200" r="40" fill="${accent}"/>
    <circle cx="410" cy="200" r="40" fill="${accent}"/>
    <circle cx="320" cy="300" r="120" fill="${accent}"/>
    <ellipse cx="320" cy="330" rx="54" ry="40" fill="${sun}"/>
    <circle cx="280" cy="280" r="10" fill="${ink}"/>
    <circle cx="360" cy="280" r="10" fill="${ink}"/>
    <ellipse cx="320" cy="318" rx="12" ry="8" fill="${ink}"/>
  `,
  gift: (accent) => `
    <rect x="160" y="240" width="320" height="220" rx="24" fill="${accent}"/>
    <rect x="290" y="240" width="60" height="220" fill="${sun}"/>
    <rect x="160" y="320" width="320" height="40" fill="${sun}"/>
    <path d="M320 240 C260 180 200 220 250 250 C280 160 380 160 390 250 C440 210 400 170 320 240" fill="${coral}"/>
  `,
};

const products = {
  "rc-rally-buggy": "car",
  "rc-sky-hopper": "heli",
  "rc-digger-truck": "truck",
  "city-car-five-pack": "cars",
  "first-balance-bike": "bike",
  "wooden-train-loop": "train",
  "soft-rattle-trio": "rattle",
  "teether-keys": "teether",
  "cloth-garden-book": "book",
  "doll-and-carry-cot": "doll",
  "mini-kitchen-set": "kitchen",
  "doctor-visit-kit": "doctor",
  "jumbo-blocks-60": "blocks",
  "animal-floor-puzzle": "puzzle",
  "magnetic-tile-starter": "tiles",
  "kitchen-science-box": "science",
  "art-caddy-24": "art",
  "lcd-writing-tablet": "tablet",
  "bubble-wand-pack": "bubbles",
  "garden-swing-seat": "swing",
  "snakes-and-ladders": "board",
  "family-card-game": "cards",
  "strategy-duel-cards": "duel",
  "hug-bear-40": "bear",
  "mystery-gift-box": "gift",
};

const categories = {
  "remote-control": "car",
  "vehicles-and-ride-ons": "bike",
  "baby-toys": "rattle",
  "dolls-and-pretend-play": "doll",
  "building-and-puzzles": "blocks",
  "learning-and-creative": "art",
  "outdoor-and-water-play": "bubbles",
  "games-and-fun": "board",
  "soft-toys": "bear",
  "gift-ideas": "gift",
};

const hero = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
  <rect width="640" height="640" fill="#FAFAF7"/>
  <g transform="translate(70 80) rotate(-12 120 120)">
    <rect width="180" height="180" rx="36" fill="#4F46E5"/>
  </g>
  <g transform="translate(250 240) rotate(10 90 90)">
    <rect width="170" height="170" rx="34" fill="#FBBF24"/>
  </g>
  <g transform="translate(390 70) rotate(16 80 80)">
    <rect width="150" height="150" rx="30" fill="#FB7185"/>
  </g>
  <g transform="translate(180 40) rotate(-8 70 70)">
    <rect width="120" height="120" rx="26" fill="#22C55E"/>
  </g>
</svg>
`;

await mkdir(path.join(root, "art"), { recursive: true });
await mkdir(path.join(root, "posters"), { recursive: true });

for (const [slug, motif] of Object.entries(products)) {
  const draw = toys[motif];
  await writeFile(path.join(root, "art", `${slug}.svg`), svg(draw(brand), true));
  await writeFile(path.join(root, "art", `${slug}-alt.svg`), svg(draw(coral), true));
}

for (const [slug, motif] of Object.entries(categories)) {
  await writeFile(path.join(root, "art", `cat-${slug}.svg`), svg(toys[motif](brand), false));
}

await writeFile(path.join(root, "art", "who-baby.svg"), svg(toys.rattle(coral), false));
await writeFile(path.join(root, "art", "who-boys.svg"), svg(toys.car(brand), false));
await writeFile(path.join(root, "art", "who-girls.svg"), svg(toys.doll(sun), false));
await writeFile(path.join(root, "art", "age-0-1.svg"), svg(toys.rattle(coral), false));
await writeFile(path.join(root, "art", "age-1-3.svg"), svg(toys.blocks(), false));
await writeFile(path.join(root, "art", "age-3-6.svg"), svg(toys.car(brand), false));
await writeFile(path.join(root, "art", "age-6-12.svg"), svg(toys.bike(brand), false));
await writeFile(path.join(root, "art", "age-12-plus.svg"), svg(toys.duel(brand), false));

for (const amount of [500, 1000, 2000, 5000]) {
  const label = new Intl.NumberFormat("en-PK").format(amount);
  const body = `
    <rect x="150" y="180" width="340" height="220" rx="36" fill="${sun}"/>
    <text x="320" y="310" text-anchor="middle" font-family="ui-rounded, system-ui, sans-serif" font-size="72" font-weight="700" fill="${ink}">${label}</text>
  `;
  await writeFile(path.join(root, "art", `budget-${amount}.svg`), svg(body, false));
}

await writeFile(path.join(root, "posters", "hero.svg"), hero);
console.log("Art written to public/art and public/posters");
