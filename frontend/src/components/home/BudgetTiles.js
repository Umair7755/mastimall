import Link from "next/link";
import { ArrowRight, Crown, Gift, Medal, Rocket } from "lucide-react";
import { PriceRibbon } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BUDGETS } from "@/lib/constants";
import { budgetLabel, formatPkr } from "@/lib/format";
import { CONTAINER } from "@/lib/layout";

const THEMES = [
  { bg: "#DBEAFE", accent: "#2563EB", Icon: Gift, blurb: "Everyday surprises for little hands." },
  { bg: "#FCE7F3", accent: "#DB2777", Icon: Medal, blurb: "More play, more smiles, still light." },
  { bg: "#D1FAE5", accent: "#059669", Icon: Rocket, blurb: "Toys they talk about for weeks." },
  { bg: "#FFEDD5", accent: "#EA580C", Icon: Crown, blurb: "Gifts they will remember." },
];

const CAPTIONS = [
  "Tiny joys, big smiles",
  "More fun, more play",
  "Toys they talk about",
  "Gifts they will remember",
];

export function BudgetTiles({ title = "Shop by budget", limits }) {
  const tiles = (limits?.length ? limits : BUDGETS.map((item) => item.max)).map((limit, index) => {
    const known = BUDGETS.find((item) => item.max === Number(limit));
    const theme = THEMES[index % THEMES.length];
    return {
      ...(known || {
        slug: `under-${limit}`,
        label: budgetLabel(limit),
        max: Number(limit),
        caption: CAPTIONS[index % CAPTIONS.length],
      }),
      theme,
    };
  });

  return (
    <section id="budget" className={`${CONTAINER} scroll-mt-36 py-3 lg:py-5`}>
      <SectionHeading title={title} text="Pick a price band — clear tags, quick browse." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {tiles.map((item) => {
          const { accent, bg, Icon, blurb } = item.theme;
          return (
            <Link
              key={item.slug}
              href={`/budget/${item.slug}`}
              className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[1.75rem] p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-lift sm:min-h-[300px] sm:p-5"
              style={{ backgroundColor: item.color || bg }}
            >
              <div className="flex items-start justify-between gap-3">
                <PriceRibbon
                  label="UNDER"
                  value={formatPkr(item.max).replace("Rs ", "Rs. ")}
                  color={accent}
                />
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-soft"
                  style={{ backgroundColor: accent }}
                >
                  <Icon aria-hidden="true" size={22} />
                </span>
              </div>

              <div className="relative z-[1] mt-5">
                <h3 className="font-display text-2xl font-semibold leading-tight text-ink lg:text-[28px]">
                  {item.caption || CAPTIONS[0]}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{blurb}</p>
              </div>

              <span
                className="pointer-events-none absolute -right-6 bottom-16 h-36 w-36 rounded-full bg-white/35"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute right-10 bottom-10 h-20 w-20 rounded-full bg-white/25"
                aria-hidden="true"
              />

              <span className="relative z-[1] mt-auto inline-flex min-h-11 w-full items-center justify-between rounded-full bg-white px-4 font-display text-sm font-semibold shadow-soft transition group-hover:translate-x-0.5">
                <span style={{ color: accent }}>Explore Toys</span>
                <ArrowRight aria-hidden="true" size={16} style={{ color: accent }} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
