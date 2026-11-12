import { Suspense } from "react";
import { ProductListing } from "@/components/catalog/ProductListing";
import { SearchField } from "@/components/layout/SearchField";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { getDepartments, getProducts } from "@/lib/data";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { one, productQuery } from "@/lib/paths";

function titleFor(query) {
  if (one(query.q)) return `Results for “${one(query.q)}”`;
  if (one(query.onSale) === "1") return "Deals";
  if (one(query.isNew) === "1" || one(query.sort) === "new") return "New arrivals";
  return "Search";
}

async function SearchContent({ searchParams }) {
  const query = await searchParams;
  const departments = await getDepartments().catch(() => []);
  const categories = departments.flatMap((department) =>
    (department.categories || []).map((category) => ({ ...category, href: `/${department.slug}/${category.slug}` }))
  );
  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result = (await getProducts(productQuery({ searchParams: query }))) || result;
  } catch (error) {
    problem = error.message;
  }
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <SearchField id="store-search-page" initial={one(query.q)} />
      </div>
      <ProductListing
        title={titleFor(query)}
        pathname="/search"
        searchParams={query}
        result={result}
        filters={DEFAULT_FILTERS}
        categories={categories}
        problem={problem}
      />
    </div>
  );
}

export default function SearchPage({ searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
