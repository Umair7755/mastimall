import Link from "next/link";
import {
  Baby,
  BadgePercent,
  Cake,
  PackageCheck,
  RotateCcw,
  Tag,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { PriceRangeSlider } from "@/components/catalog/PriceRangeSlider";
import { AGE_BANDS, DEFAULT_FILTERS, ageLabel, audienceLabel } from "@/lib/constants";
import { hrefWith, one } from "@/lib/paths";
import { cn } from "@/lib/cn";

function optionLabel(key, option) {
  if (key === "ageBands" || key === "age") return ageLabel(option);
  if (key === "audience") return audienceLabel(option);
  return option;
}

function audienceIcon(option) {
  if (option === "baby") return Baby;
  if (option === "unisex") return Users;
  return UserRound;
}

function filterChip(selected) {
  return cn(
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm transition",
    selected
      ? "border-brand bg-brand text-white shadow-sm"
      : "border-line/80 bg-white text-ink hover:border-brand/40 hover:bg-brand-soft/60"
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="border-b border-line/70 pb-5 last:border-b-0 last:pb-0">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {Icon ? (
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-soft text-brand">
            <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
          </span>
        ) : null}
        {title}
      </p>
      {children}
    </section>
  );
}

function countsMap(list = []) {
  return Object.fromEntries((list || []).map((item) => [item.value, item.count]));
}

function mergeFilters(filters = [], facets) {
  const base = Array.isArray(filters) && filters.length ? [...filters] : [...DEFAULT_FILTERS];
  const byKey = new Map(base.map((filter) => [filter.key, { ...filter }]));

  if (!byKey.has("ageBands") && !byKey.has("age")) {
    byKey.set("ageBands", DEFAULT_FILTERS.find((item) => item.key === "ageBands"));
  }
  if (!byKey.has("audience")) {
    byKey.set("audience", DEFAULT_FILTERS.find((item) => item.key === "audience"));
  }
  if (!byKey.has("price")) {
    byKey.set("price", DEFAULT_FILTERS.find((item) => item.key === "price"));
  }

  if (facets?.brands?.length) {
    const brand = byKey.get("brand") || { key: "brand", label: "Brand", type: "select", options: [] };
    brand.options = facets.brands.map((item) => item.value);
    byKey.set("brand", brand);
  }

  if (facets?.ageBands?.length) {
    const age = byKey.get("ageBands") || byKey.get("age");
    if (age) {
      const live = facets.ageBands.filter((item) => item.count > 0).map((item) => item.value);
      if (live.length) age.options = live;
    }
  }

  if (facets?.audience?.length) {
    const audience = byKey.get("audience");
    if (audience) {
      const live = facets.audience.filter((item) => item.count > 0).map((item) => item.value);
      if (live.length) audience.options = live;
    }
  }

  if (facets?.price) {
    const price = byKey.get("price");
    if (price) {
      price.min = facets.price.min;
      price.max = Math.max(facets.price.max, facets.price.min + 100);
    }
  }

  const order = ["ageBands", "age", "audience", "price", "brand", "inStock", "onSale"];
  const ordered = [];
  for (const key of order) {
    if (byKey.has(key)) {
      ordered.push(byKey.get(key));
      byKey.delete(key);
    }
  }
  for (const value of byKey.values()) ordered.push(value);
  return ordered.filter(Boolean);
}

function sortedAgeParam(values) {
  const set = new Set(values);
  return AGE_BANDS.map((band) => band.slug).filter((band) => set.has(band)).join(",") || null;
}

export function FilterLinks({
  filters = [],
  pathname,
  searchParams = {},
  hideAdult = false,
  facets = null,
}) {
  const list = mergeFilters(filters, facets);
  const ageCounts = countsMap(facets?.ageBands);
  const audienceCounts = countsMap(facets?.audience);
  const brandCounts = countsMap(facets?.brands);
  const toggles = list.filter((filter) => filter.type === "toggle");
  const main = list.filter((filter) => filter.type !== "toggle");
  const hasActive = ["age", "audience", "minPrice", "maxPrice", "brand", "inStock", "onSale"].some(
    (key) => one(searchParams[key])
  );

  return (
    <div className="grid gap-5">
      {main.map((filter) => {
        if (filter.key === "ageBands" || filter.key === "age") {
          const options = (filter.options || DEFAULT_FILTERS[0].options).filter(
            (option) => !(hideAdult && option === "12-plus")
          );
          const selected = new Set(
            one(searchParams.age)
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          );
          return (
            <Section key={filter.key} title={filter.label || "Age"} icon={Cake}>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const active = selected.has(option);
                  const count = ageCounts[option];
                  const next = new Set(selected);
                  if (active) next.delete(option);
                  else next.add(option);
                  return (
                    <Link
                      key={option}
                      href={hrefWith(pathname, searchParams, { age: sortedAgeParam(next) })}
                      className={filterChip(active)}
                      title={count != null ? `${count} toys` : undefined}
                    >
                      <Cake size={13} strokeWidth={2.25} aria-hidden="true" className="opacity-80" />
                      {ageLabel(option)}
                      {count != null ? (
                        <span className={cn("text-[11px]", active ? "text-white/80" : "text-ink-muted")}>
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </Section>
          );
        }

        if (filter.key === "audience" || filter.type === "chips") {
          const queryKey = filter.key === "audience" ? "audience" : filter.key;
          const selected = one(searchParams[queryKey]);
          const options = (filter.options || []).filter((option) => !(hideAdult && option === "12-plus"));
          return (
            <Section key={filter.key} title={filter.label || "For"} icon={Users}>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const active = selected === option;
                  const count = queryKey === "audience" ? audienceCounts[option] : undefined;
                  const Icon = queryKey === "audience" ? audienceIcon(option) : Tag;
                  return (
                    <Link
                      key={option}
                      href={hrefWith(pathname, searchParams, {
                        [queryKey]: active ? null : option,
                      })}
                      className={filterChip(active)}
                    >
                      <Icon size={13} strokeWidth={2.25} aria-hidden="true" className="opacity-80" />
                      {optionLabel(filter.key, option)}
                      {count != null ? (
                        <span className={cn("text-[11px]", active ? "text-white/80" : "text-ink-muted")}>
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </Section>
          );
        }

        if (filter.type === "range" || filter.key === "price") {
          return (
            <Section key={filter.key} title={filter.label || "Price"} icon={Wallet}>
              <PriceRangeSlider
                pathname={pathname}
                searchParams={searchParams}
                minBound={Number(filter.min) >= 0 ? Number(filter.min) : facets?.price?.min || 0}
                maxBound={Number(filter.max) > 0 ? Number(filter.max) : facets?.price?.max || 10000}
              />
            </Section>
          );
        }

        if (filter.type === "select" || filter.key === "brand") {
          const selected = one(searchParams[filter.key]);
          const options = filter.options || [];
          if (!options.length) return null;
          return (
            <Section key={filter.key} title={filter.label || "Brand"} icon={Tag}>
              <div className="grid gap-1">
                {options.map((option) => {
                  const active = selected === option;
                  const count = brandCounts[option];
                  return (
                    <Link
                      key={option}
                      href={hrefWith(pathname, searchParams, {
                        [filter.key]: active ? null : option,
                      })}
                      className={cn(
                        "flex min-h-10 items-center justify-between gap-2 rounded-xl px-2.5 text-sm transition",
                        active ? "bg-brand-soft font-semibold text-brand" : "text-ink hover:bg-[#f3efe6]"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Tag size={13} strokeWidth={2.25} aria-hidden="true" className="opacity-70" />
                        {option}
                      </span>
                      {count != null ? <span className="text-xs text-ink-muted">{count}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </Section>
          );
        }

        return null;
      })}

      {toggles.length ? (
        <Section title="Availability" icon={PackageCheck}>
          <div className="grid gap-2">
            {toggles.map((filter) => {
              const queryKey =
                filter.key === "inStock" ? "inStock" : filter.key === "onSale" ? "onSale" : filter.key;
              const selected = one(searchParams[queryKey]) === "1";
              const count =
                queryKey === "inStock" ? facets?.inStock : queryKey === "onSale" ? facets?.onSale : null;
              const Icon = queryKey === "onSale" ? BadgePercent : PackageCheck;
              return (
                <Link
                  key={filter.key}
                  href={hrefWith(pathname, searchParams, { [queryKey]: selected ? null : "1" })}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm transition",
                    selected ? "border-brand bg-brand-soft shadow-sm" : "border-line/80 bg-white hover:border-brand/30"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg",
                      selected ? "bg-brand text-white" : "bg-[#f3efe6] text-ink-muted"
                    )}
                    aria-hidden="true"
                  >
                    <Icon size={15} strokeWidth={2.25} />
                  </span>
                  <span className="flex-1 font-medium">{filter.label}</span>
                  {count != null ? <span className="text-xs text-ink-muted">{count}</span> : null}
                  <span
                    className={cn(
                      "grid h-4 w-4 place-items-center rounded border text-[10px] leading-none",
                      selected ? "border-brand bg-brand text-white" : "border-line bg-white"
                    )}
                    aria-hidden="true"
                  >
                    {selected ? "✓" : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        </Section>
      ) : null}

      {hasActive ? (
        <Link
          href={pathname}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-brand-soft/50"
        >
          <RotateCcw size={15} strokeWidth={2.25} aria-hidden="true" />
          Clear all filters
        </Link>
      ) : null}
    </div>
  );
}
