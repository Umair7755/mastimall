"use client";

import { FindMallRail } from "@/components/home/FindMallRail";
import { HomeProductRail } from "@/components/home/HomeProductRail";
import { TrustStrip } from "@/components/home/TrustStrip";
import { buildDepartmentFinderGroups } from "@/lib/finderGroups";
import { CONTAINER } from "@/lib/layout";

const TRUST_POINTS = [
  {
    title: "Flexible payment",
    text: "COD, JazzCash, or EasyPaisa. Wallet orders need a receipt at checkout.",
  },
  {
    title: "Prices checked again",
    text: "Totals are calculated on our server from live price and stock.",
  },
  {
    title: "Free delivery from Rs 3,000",
    text: "Under that, delivery is Rs 200 in big cities and Rs 250 elsewhere.",
  },
];

/**
 * Department landing — no hero.
 * New arrivals (carousel) first, then full All grid (no carousel).
 */
export function DepartmentHome({ department, all = [], newArrivals = [] }) {
  const slug = department?.slug || "toys";
  const themeKey = department?.themeKey || slug;
  const isDecor = slug === "decor" || themeKey === "decor";
  const groups = buildDepartmentFinderGroups(slug);
  const name = department?.name || slug;

  return (
    <div data-department={themeKey} className="pb-2">
      <div className={`${CONTAINER} pt-4 sm:pt-5`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Shop</p>
        <h1 className="font-display text-[28px] font-semibold leading-tight text-ink sm:text-[36px]">
          {name}
        </h1>
        {department?.seo?.description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted sm:text-base">{department.seo.description}</p>
        ) : null}
      </div>

      <FindMallRail
        id="find"
        groups={groups}
        title={isDecor ? "Style the home" : "Find faster"}
        subtitle={isDecor ? "Room or budget" : "Tap a filter"}
        mobileLabel={`Find ${name.toLowerCase()} · tap a chip`}
        seeAllHref={`/search?department=${slug}`}
        shell={
          isDecor
            ? "border-[#99f6e4]/60 bg-gradient-to-r from-[#ecfdf5] via-white to-[#f0fdfa]"
            : "border-line/60 bg-gradient-to-r from-[#fff4e0] via-white to-[#ebe7ff]"
        }
      />

      {newArrivals.length ? (
        <HomeProductRail
          theme={isDecor ? "decorNew" : "toysNew"}
          title={`New ${name.toLowerCase()}`}
          text="Just arrived on the shelf."
          moreHref={`/search?department=${slug}&isNew=1&sort=new`}
          products={newArrivals}
          layout="row"
        />
      ) : null}

      {all.length ? (
        <HomeProductRail
          theme={isDecor ? "decorAll" : "toysAll"}
          title={`All ${name.toLowerCase()}`}
          text={`Every ${name.toLowerCase()} piece on the shelf.`}
          moreHref={`/search?department=${slug}`}
          products={all}
          layout="grid"
        />
      ) : null}

      <TrustStrip title="Why Masti Mall" points={TRUST_POINTS} />
    </div>
  );
}
