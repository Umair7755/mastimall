import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { PictureTile } from "@/components/home/PictureTile";
import { FilterLinks } from "@/components/catalog/FilterLinks";
import { MobileFilters } from "@/components/catalog/MobileFilters";
import { SortBar } from "@/components/catalog/SortBar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { DEFAULT_FILTERS, ageLabel, audienceLabel } from "@/lib/constants";
import { formatPkr } from "@/lib/format";
import { hrefWith, one } from "@/lib/paths";

function ActiveFilters({ pathname, searchParams }) {
  const chips = [];
  const age = one(searchParams.age);
  if (age) {
    age.split(",").filter(Boolean).forEach((band) => {
      chips.push({
        key: `age-${band}`,
        label: `Age ${ageLabel(band)}`,
        href: hrefWith(pathname, searchParams, {
          age:
            age
              .split(",")
              .filter((item) => item && item !== band)
              .join(",") || null,
        }),
      });
    });
  }
  const audience = one(searchParams.audience);
  if (audience) {
    chips.push({
      key: "audience",
      label: audienceLabel(audience),
      href: hrefWith(pathname, searchParams, { audience: null }),
    });
  }
  const brand = one(searchParams.brand);
  if (brand) {
    chips.push({
      key: "brand",
      label: brand,
      href: hrefWith(pathname, searchParams, { brand: null }),
    });
  }
  const minPrice = one(searchParams.minPrice);
  const maxPrice = one(searchParams.maxPrice);
  if (minPrice || maxPrice) {
    chips.push({
      key: "price",
      label: `${minPrice ? formatPkr(Number(minPrice)) : "Rs 0"} – ${maxPrice ? formatPkr(Number(maxPrice)) : "any"}`,
      href: hrefWith(pathname, searchParams, { minPrice: null, maxPrice: null }),
    });
  }
  if (one(searchParams.inStock) === "1") {
    chips.push({
      key: "inStock",
      label: "In stock",
      href: hrefWith(pathname, searchParams, { inStock: null }),
    });
  }
  if (one(searchParams.onSale) === "1") {
    chips.push({
      key: "onSale",
      label: "On sale",
      href: hrefWith(pathname, searchParams, { onSale: null }),
    });
  }

  if (!chips.length) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3 text-xs font-semibold text-brand"
        >
          {chip.label}
          <X size={14} strokeWidth={2.5} aria-hidden="true" />
        </Link>
      ))}
      <Link href={pathname} className="text-xs font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline">
        Clear all
      </Link>
    </div>
  );
}

export function ProductListing({
  title,
  intro,
  pathname,
  searchParams = {},
  result,
  filters,
  categories = [],
  breadcrumbs,
  hideAdult = false,
  problem = "",
}) {
  const items = result?.items || [];
  const page = result?.page || 1;
  const pages = result?.pages || 0;
  const facets = result?.facets || null;
  const activeFilters = filters?.length ? filters : DEFAULT_FILTERS;
  const department = one(searchParams.department);
  const noun = department === "decor" ? "item" : department === "toys" ? "toy" : "item";
  const nounPlural = department === "decor" ? "items" : department === "toys" ? "toys" : "items";

  return (
    <div className="mx-auto w-full max-w-[1920px] px-2 py-6 sm:px-3 lg:px-4 xl:px-5">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      {title ? <h1 className="font-display text-[32px] font-semibold lg:text-[44px]">{title}</h1> : null}
      {intro ? <p className="mt-3 max-w-2xl text-ink-muted">{intro}</p> : null}

      <div className="mt-6 md:hidden">
        <MobileFilters>
          <FilterLinks
            filters={activeFilters}
            pathname={pathname}
            searchParams={searchParams}
            hideAdult={hideAdult}
            facets={facets}
          />
        </MobileFilters>
      </div>

      <div className="mt-4 md:mt-6 md:grid md:grid-cols-[16rem_1fr] md:gap-6 lg:grid-cols-[17.5rem_1fr] lg:gap-8">
        <aside className="hidden md:block">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-line/70 bg-gradient-to-b from-white via-white to-[#faf7f1] p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-display text-lg font-semibold">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white shadow-sm">
                  <SlidersHorizontal size={15} strokeWidth={2.25} aria-hidden="true" />
                </span>
                Filters
              </p>
              {["age", "audience", "minPrice", "maxPrice", "brand", "inStock", "onSale"].some((key) =>
                one(searchParams[key])
              ) ? (
                <Link href={pathname} className="text-xs font-semibold text-brand hover:underline">
                  Reset
                </Link>
              ) : null}
            </div>
            <FilterLinks
              filters={activeFilters}
              pathname={pathname}
              searchParams={searchParams}
              hideAdult={hideAdult}
              facets={facets}
            />
          </div>
        </aside>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {problem
                ? "—"
                : `${result?.total ?? 0} ${result?.total === 1 ? noun : nounPlural}`}
            </p>
            <SortBar pathname={pathname} searchParams={searchParams} />
          </div>

          <ActiveFilters pathname={pathname} searchParams={searchParams} />

          {problem ? <p className="rounded-card bg-surface p-6">{problem}</p> : null}
          {!problem && items.length ? (
            <>
              <ProductGrid products={items} />
              {pages > 1 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {Array.from({ length: pages }, (_, index) => {
                    const number = index + 1;
                    return (
                      <Link
                        key={number}
                        href={hrefWith(pathname, searchParams, { page: number <= 1 ? null : String(number) }, { resetPage: false })}
                        className={`grid h-11 w-11 place-items-center rounded-full text-sm font-semibold ${
                          number === page ? "bg-brand text-white" : "bg-surface text-ink"
                        }`}
                      >
                        {number}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </>
          ) : null}
          {!problem && !items.length ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/70 p-8">
              <p className="font-display text-2xl">No {nounPlural} match those filters.</p>
              <p className="mt-2 text-ink-muted">Try clearing a filter, or pick another category.</p>
              <Link
                href={pathname}
                className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white"
              >
                Clear filters
              </Link>
              {categories.length ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {categories.map((category) => (
                    <PictureTile
                      key={category.href || category.slug}
                      href={category.href}
                      title={category.name}
                      image={category.image?.url || category.image}
                      color={category.color}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
