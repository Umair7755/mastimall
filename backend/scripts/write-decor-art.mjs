import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("frontend/public/art/decor");
fs.mkdirSync(dir, { recursive: true });

function svg(title, c1, c2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" fill="none">
  <rect width="640" height="640" rx="48" fill="${c1}"/>
  <circle cx="180" cy="160" r="90" fill="${c2}" opacity="0.55"/>
  <circle cx="480" cy="480" r="120" fill="#fff" opacity="0.35"/>
  <rect x="160" y="210" width="320" height="220" rx="28" fill="#fff" opacity="0.78"/>
  <text x="320" y="335" text-anchor="middle" font-family="Segoe UI, Arial" font-size="28" font-weight="700" fill="#0f172a">${title}</text>
</svg>`;
}

const items = [
  ["cat-wall-art", "Wall art", "#EDE9FE", "#C4B5FD"],
  ["cat-cushions-throws", "Cushions", "#FCE7F3", "#F9A8D4"],
  ["cat-lamps-lighting", "Lamps", "#FEF3C7", "#FBBF24"],
  ["cat-vases-planters", "Vases", "#D1FAE5", "#6EE7B7"],
  ["cat-frames-mirrors", "Frames", "#E0E7FF", "#93C5FD"],
  ["cat-table-decor", "Table", "#FFEDD5", "#FDBA74"],
  ["wall-art", "Decor", "#EDE9FE", "#A78BFA"],
  ["sunset-canvas-set", "Sunset", "#FFEDD5", "#FB7185"],
  ["sunset-canvas-set-alt", "Sunset", "#FEF3C7", "#F59E0B"],
  ["kids-alphabet-wall-print", "ABC", "#FCE7F3", "#F9A8D4"],
  ["kids-alphabet-wall-print-alt", "ABC", "#EDE9FE", "#C4B5FD"],
  ["cloud-cushion-pair", "Cushion", "#DBEAFE", "#93C5FD"],
  ["cloud-cushion-pair-alt", "Cushion", "#FCE7F3", "#F9A8D4"],
  ["linen-throw-blanket", "Throw", "#FEF3C7", "#D6D3D1"],
  ["linen-throw-blanket-alt", "Throw", "#FFEDD5", "#A8A29E"],
  ["glow-dome-table-lamp", "Lamp", "#FEF3C7", "#FBBF24"],
  ["glow-dome-table-lamp-alt", "Lamp", "#FFEDD5", "#F59E0B"],
  ["arc-desk-lamp", "Desk", "#E2E8F0", "#64748B"],
  ["arc-desk-lamp-alt", "Desk", "#F1F5F9", "#475569"],
  ["clay-curve-vase", "Vase", "#D1FAE5", "#34D399"],
  ["clay-curve-vase-alt", "Vase", "#ECFDF5", "#6EE7B7"],
  ["woven-planter-basket", "Planter", "#FEF3C7", "#D97706"],
  ["woven-planter-basket-alt", "Planter", "#FFEDD5", "#F59E0B"],
  ["slim-gallery-frame-set", "Frames", "#E0E7FF", "#6366F1"],
  ["slim-gallery-frame-set-alt", "Frames", "#EEF2FF", "#818CF8"],
  ["round-accent-mirror", "Mirror", "#F1F5F9", "#94A3B8"],
  ["round-accent-mirror-alt", "Mirror", "#E2E8F0", "#64748B"],
  ["brass-tray-candle-set", "Candles", "#FEF3C7", "#CA8A04"],
  ["brass-tray-candle-set-alt", "Candles", "#FFEDD5", "#D97706"],
  ["marble-coaster-quartet", "Coasters", "#F8FAFC", "#CBD5E1"],
  ["marble-coaster-quartet-alt", "Coasters", "#F1F5F9", "#94A3B8"],
];

for (const [name, title, c1, c2] of items) {
  fs.writeFileSync(path.join(dir, `${name}.svg`), svg(title, c1, c2));
}
console.log(`Wrote ${items.length} décor art files to ${dir}`);
