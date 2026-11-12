import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BudgetTiles } from "@/components/home/BudgetTiles";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { BUDGETS, DEFAULT_FILTERS, budgetBySlug } from "@/lib/constants";
import { getDepartments, getProducts } from "@/lib/data";
import { productQuery } from "@/lib/paths";

export function generateStaticParams() {
  return BUDGETS.map((item) => ({ limit: item.slug }));
}

export async function generateMetadata({ params }) {
  const { limit } = await params;
  const match = budgetBySlug(limit);
  if (!match) return { title: "Budget" };
  return { title: match.label, description: `Toys ${match.label.toLowerCase()}.`, alternates: { canonical: `/budget/${limit}` } };
}

async function BudgetContent({ params, searchParams }) {
  const { limit } = await params;
  const match = budgetBySlug(limit);
  if (!match) notFound();
  const query = await searchParams;
  const departments = await getDepartments().catch(() => []);
  const categories = departments.flatMap((department) =>
    (department.categories || []).map((category) => ({ ...category, href: `/${department.slug}/${category.slug}` }))
  );
  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result = (await getProducts(productQuery({ maxPrice: match.max, excludeAdult: true, searchParams: query }))) || result;
  } catch (error) {
    problem = error.message;
  }
  return (
    <>
      <BudgetTiles title="Pick a budget" />
      <ProductListing
        title={match.label}
        pathname={`/budget/${limit}`}
        searchParams={query}
        result={result}
        filters={DEFAULT_FILTERS}
        categories={categories}
        problem={problem}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: match.label, href: `/budget/${limit}` },
        ]}
      />
    </>
  );
}

export default function BudgetPage({ params, searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <BudgetContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
