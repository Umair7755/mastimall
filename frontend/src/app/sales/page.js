import { Suspense } from "react";
import { Percent, Tag } from "lucide-react";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { getDepartments, getProducts } from "@/lib/data";
import { productQuery } from "@/lib/paths";

export const metadata = {
  title: "Sales",
  description: "All toys and décor currently on sale at Masti Mall.",
  alternates: { canonical: "/sales" },
};

async function SalesContent({ searchParams }) {
  const query = await searchParams;
  const departments = await getDepartments().catch(() => []);
  const categories = departments.flatMap((item) =>
    (item.categories || []).map((category) => ({ ...category, href: `/${item.slug}/${category.slug}` }))
  );

  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result =
      (await getProducts(
        productQuery({
          searchParams: { ...query, onSale: "1" },
          sort: query?.sort || "popular",
          limit: "24",
        })
      )) || result;
  } catch (error) {
    problem = error.message;
  }

  return (
    <div>
      <div className="mx-auto w-full max-w-[1920px] px-2 pt-4 sm:px-3 sm:pt-6 lg:px-4 xl:px-5">
        <div className="overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#ffedd5] px-4 py-4 shadow-soft ring-1 ring-[#fda4af]/50 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e11d48] px-3 py-1.5 font-display text-sm font-bold text-white shadow-sm">
              <Percent size={14} strokeWidth={2.5} aria-hidden="true" />
              On sale
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#9f1239] ring-1 ring-[#fda4af]/60">
              <Tag size={13} aria-hidden="true" />
              Toys & décor deals
            </span>
          </div>
          <h1 className="mt-3 font-display text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Sales
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink/70 sm:text-base">
            Every item with a sale price — tap a deal and save.
          </p>
        </div>
      </div>

      <ProductListing
        title=""
        intro=""
        pathname="/sales"
        searchParams={{ ...query, onSale: "1" }}
        result={result}
        filters={DEFAULT_FILTERS.filter((f) => f.key !== "onSale")}
        categories={categories}
        problem={problem}
        hideMobileFind
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Sales", href: "/sales" },
        ]}
      />
    </div>
  );
}

export default function SalesPage({ searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <SalesContent searchParams={searchParams} />
    </Suspense>
  );
}
