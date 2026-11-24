import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { BUDGETS, DEFAULT_FILTERS, budgetBySlug, budgetPriceRange } from "@/lib/constants";
import { getDepartments, getProducts } from "@/lib/data";
import { one, productQuery } from "@/lib/paths";

export function generateStaticParams() {
  return BUDGETS.map((item) => ({ limit: item.slug }));
}

export async function generateMetadata({ params, searchParams }) {
  const { limit } = await params;
  const query = await searchParams;
  const match = budgetBySlug(limit);
  const department = one(query?.department);
  if (!match) return { title: "Budget" };
  const scope = department === "decor" ? "Décor" : department === "toys" ? "Toys" : "Shop";
  return {
    title: `${match.label} · ${scope}`,
    description: `${scope} ${match.label.toLowerCase()}.`,
    alternates: { canonical: `/budget/${limit}` },
  };
}

async function BudgetContent({ params, searchParams }) {
  const { limit } = await params;
  const match = budgetBySlug(limit);
  if (!match) notFound();
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
    const range = budgetPriceRange(match);
    result =
      (await getProducts(
        productQuery({
          minPrice: range.minPrice || undefined,
          maxPrice: range.maxPrice || undefined,
          budget: match.slug,
          department: department || undefined,
          excludeAdult: department !== "decor",
          searchParams: query,
        })
      )) || result;
  } catch (error) {
    problem = error.message;
  }
  const title =
    department === "decor"
      ? `Décor ${match.label.toLowerCase()}`
      : department === "toys"
        ? `Toys ${match.label.toLowerCase()}`
        : match.label;
  return (
    <ProductListing
      title={title}
      pathname={`/budget/${limit}`}
      searchParams={query}
      result={result}
      filters={DEFAULT_FILTERS}
      categories={categories}
      problem={problem}
      breadcrumbs={[
        { label: "Home", href: "/" },
        ...(department === "decor"
          ? [{ label: "Decor", href: "/decor" }]
          : department === "toys"
            ? [{ label: "Toys", href: "/toys" }]
            : []),
        { label: match.label, href: `/budget/${limit}${department ? `?department=${department}` : ""}` },
      ]}
    />
  );
}

export default function BudgetPage({ params, searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <BudgetContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
