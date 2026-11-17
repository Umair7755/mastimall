import { Suspense } from "react";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { getDepartments, getProducts } from "@/lib/data";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { one, productQuery } from "@/lib/paths";

function titleFor(query) {
  if (one(query.q)) return `Results for “${one(query.q)}”`;
  if (one(query.onSale) === "1") return "Deals";
  if (one(query.isNew) === "1" || one(query.sort) === "new") return "New arrivals";
  const department = one(query.department);
  if (department === "decor") return "Decor";
  if (department === "toys") return "Toys";
  return "Search";
}

async function SearchContent({ searchParams }) {
  const query = await searchParams;
  const department = one(query.department);
  const departments = await getDepartments().catch(() => []);
  const scoped =
    department && departments.length
      ? departments.filter((item) => item.slug === department)
      : departments;
  const categories = scoped.flatMap((item) =>
    (item.categories || []).map((category) => ({ ...category, href: `/${item.slug}/${category.slug}` }))
  );
  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result = (await getProducts(productQuery({ searchParams: query }))) || result;
  } catch (error) {
    problem = error.message;
  }
  return (
    <div data-department={department === "decor" ? "decor" : undefined}>
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
