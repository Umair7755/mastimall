"use client";

import { useMemo } from "react";
import { FindMallRail } from "@/components/home/FindMallRail";
import { HomeFindBar } from "@/components/home/HomeFindBar";
import { Hero } from "@/components/home/Hero";
import { HomeProductRail } from "@/components/home/HomeProductRail";
import { TrustStrip } from "@/components/home/TrustStrip";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { buildMallFinderGroups, DEPARTMENT_MIX_WEIGHT } from "@/lib/finderGroups";
import { formatPkr } from "@/lib/format";
import { mixProductsWeighted } from "@/lib/mixProducts";

/**
 * Home: mobile find sheet → Mall picks marquee → grid shelves.
 * Desktop keeps the full Find rail + row carousels.
 */
export function StoreHome({ hero, departments = [], newArrivals = [] }) {
  const delivery = useCheckoutSettings();
  const trustPoints = useMemo(
    () => [
      {
        title: "Flexible payment",
        text: "COD, JazzCash, or EasyPaisa. Wallet orders need a receipt at checkout.",
      },
      {
        title: "Prices checked again",
        text: "Totals are calculated on our server from live price and stock.",
      },
      {
        title: `Free delivery from ${formatPkr(delivery.freeShippingAt)}`,
        text: `Under that, delivery is ${formatPkr(delivery.nearFee)} in big cities and ${formatPkr(delivery.farFee)} elsewhere.`,
      },
      {
        title: "Toys + décor, one checkout",
        text: "Fill a cart with play and home pieces — one order, one track link.",
      },
    ],
    [delivery.farFee, delivery.freeShippingAt, delivery.nearFee]
  );
  const finderGroups = useMemo(
    () => buildMallFinderGroups(departments.length ? departments.map((d) => d.slug) : ["toys", "decor"]),
    [departments]
  );

  const mixed = useMemo(
    () =>
      mixProductsWeighted(
        departments.map((dept) => ({
          items: dept.all || [],
          weight: dept.weight ?? DEPARTMENT_MIX_WEIGHT[dept.slug] ?? 0.2,
        })),
        24
      ),
    [departments]
  );

  const toys = departments.find((d) => d.slug === "toys");
  const decor = departments.find((d) => d.slug === "decor");
  const extras = departments.filter((d) => d.slug !== "toys" && d.slug !== "decor");

  return (
    <div className="pb-4">
      <Hero
        title={hero?.title}
        text={hero?.text}
        findHref="#find"
        entries={{ who: true, age: true, budget: true }}
      />

      <div id="find" className="scroll-mt-28">
        <div className="lg:hidden">
          <HomeFindBar groups={finderGroups} seeAllHref="/search" />
        </div>
        <div className="hidden lg:block">
          <FindMallRail
            variant="home"
            groups={finderGroups}
            title="Find faster"
            subtitle="Pick who, age, type or budget"
            mobileLabel="Find toys & décor · tap a chip"
            seeAllHref="/search"
          />
        </div>
      </div>

      <div className="mt-1 space-y-1 sm:mt-2 sm:space-y-2">
        <HomeProductRail theme="mix" products={mixed} />
        <HomeProductRail theme="arrivals" products={newArrivals} />

        {toys?.all?.length ? <HomeProductRail theme="toysAll" products={toys.all} /> : null}
        {decor?.all?.length ? <HomeProductRail theme="decorAll" products={decor.all} /> : null}

        {extras.map((dept) => (
          <HomeProductRail
            key={dept.slug}
            theme="toysAll"
            title={`All ${dept.name || dept.slug}`}
            text={`Browse the ${dept.name || dept.slug} shelf.`}
            moreHref={`/${dept.slug}`}
            products={dept.all}
          />
        ))}
      </div>

      <TrustStrip title="Why Masti Mall" points={trustPoints} />
    </div>
  );
}
