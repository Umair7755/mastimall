"use client";

import { FindMallRail } from "@/components/home/FindMallRail";
import { DepartmentFindControl } from "@/components/home/DepartmentFindControl";
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
 * Department landing — mobile: title + Find button (sheet); products start immediately.
 * Desktop: keeps the full Find rail.
 */
export function DepartmentHome({ department, all = [], newArrivals = [] }) {
  const slug = department?.slug || "toys";
  const themeKey = department?.themeKey || slug;
  const isDecor = slug === "decor" || themeKey === "decor";
  const groups = buildDepartmentFinderGroups(slug);
  const name = department?.name || slug;
  const findTitle = isDecor ? "Style the home" : "Find faster";
  const seeAllHref = `/search?department=${slug}`;

  return (
    <div data-department={themeKey} className="pb-2">
      <div className={`${CONTAINER} pt-3 sm:pt-5`}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Shop</p>
            <h1 className="font-display text-[28px] font-semibold leading-none text-ink sm:text-[36px]">
              {name}
            </h1>
          </div>
          <div className="relative z-20 lg:hidden">
            <DepartmentFindControl
              groups={groups}
              title={findTitle}
              seeAllHref={seeAllHref}
              tone={isDecor ? "decor" : "toys"}
            />
          </div>
        </div>
        {department?.seo?.description ? (
          <p className="mt-1.5 hidden max-w-2xl text-sm text-ink-muted sm:mt-2 sm:block sm:text-base">
            {department.seo.description}
          </p>
        ) : null}
      </div>

      {/* Desktop / tablet: full finder board */}
      <div className="hidden lg:block">
        <FindMallRail
          variant="home"
          id="find"
          groups={groups}
          title={findTitle}
          subtitle={isDecor ? "Type or budget" : "Who, age or budget"}
          mobileLabel={`Find ${name.toLowerCase()} · tap a chip`}
          seeAllHref={seeAllHref}
          shell={
            isDecor
              ? "border-[#99f6e4]/60 bg-gradient-to-r from-[#ecfdf5] via-white to-[#f0fdfa]"
              : "border-line/60 bg-gradient-to-r from-[#fff4e0] via-white to-[#ebe7ff]"
          }
        />
      </div>

      <div className="mt-2 space-y-1 sm:mt-3 sm:space-y-2">
        {newArrivals.length ? (
          <HomeProductRail
            theme={isDecor ? "decorNew" : "toysNew"}
            title={`New ${name.toLowerCase()}`}
            text="Just arrived on the shelf."
            moreHref={`/search?department=${slug}&isNew=1&sort=new`}
            products={newArrivals}
            layout="row"
            eyebrow="Just in"
          />
        ) : null}

        {all.length ? (
          <HomeProductRail
            theme={isDecor ? "decorAll" : "toysAll"}
            title={`All ${name.toLowerCase()}`}
            text={`Every ${name.toLowerCase()} piece on the shelf.`}
            moreHref={seeAllHref}
            products={all}
            layout="grid"
            eyebrow="Full shelf"
          />
        ) : null}
      </div>

      <TrustStrip title="Why Masti Mall" points={TRUST_POINTS} />
    </div>
  );
}
