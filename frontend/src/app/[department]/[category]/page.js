import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { getCategory, getDepartments, getProducts } from "@/lib/data";
import { productQuery } from "@/lib/paths";

export async function generateStaticParams(context) {
  try {
    const parent = context?.params ? await context.params : {};
    const departments = await getDepartments();
    const department = departments.find((item) => item.slug === parent.department) || departments[0];
    const categories = department?.categories || [];
    if (!categories.length) return [{ category: "remote-control" }];
    return categories.map((category) => ({ category: category.slug }));
  } catch {
    return [{ category: "remote-control" }];
  }
}

export async function generateMetadata({ params }) {
  const { department, category } = await params;
  const data = await getCategory(department, category).catch(() => null);
  if (!data?.category) return { title: "Category" };
  return {
    title: data.category.seo?.title || data.category.name,
    description: data.category.seo?.description || data.category.seo?.intro || "",
    alternates: { canonical: `/${department}/${category}` },
  };
}

async function CategoryContent({ params, searchParams }) {
  const { department, category } = await params;
  const query = await searchParams;
  const data = await getCategory(department, category).catch(() => null);
  if (!data?.category) notFound();
  const qs = productQuery({ department, category, searchParams: query });
  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result = (await getProducts(qs)) || result;
  } catch (error) {
    problem = error.message;
  }
  return (
    <div data-department={data.department.themeKey}>
      <ProductListing
        title={data.category.name}
        intro={data.category.seo?.intro}
        pathname={`/${department}/${category}`}
        searchParams={query}
        result={result}
        filters={data.category.filters}
        problem={problem}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: data.department.name, href: `/${department}` },
          { label: data.category.name, href: `/${department}/${category}` },
        ]}
      />
    </div>
  );
}

export default function CategoryPage({ params, searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
