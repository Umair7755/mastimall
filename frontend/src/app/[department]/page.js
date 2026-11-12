import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { getDepartment, getDepartments, getProducts } from "@/lib/data";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { productQuery } from "@/lib/paths";

export async function generateStaticParams() {
  try {
    const departments = await getDepartments();
    if (!departments.length) return [{ department: "toys" }];
    return departments.map((department) => ({ department: department.slug }));
  } catch {
    return [{ department: "toys" }];
  }
}

export async function generateMetadata({ params }) {
  const { department: slug } = await params;
  const data = await getDepartment(slug).catch(() => null);
  if (!data?.department) return { title: "Shop" };
  return {
    title: data.department.seo?.title || data.department.name,
    description: data.department.seo?.description || "",
    alternates: { canonical: `/${slug}` },
  };
}

async function DepartmentContent({ params, searchParams }) {
  const { department: slug } = await params;
  const query = await searchParams;
  const data = await getDepartment(slug).catch(() => null);
  if (!data?.department) notFound();
  const department = data.department;
  const qs = productQuery({ department: slug, searchParams: query });
  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result = (await getProducts(qs)) || result;
  } catch (error) {
    problem = error.message;
  }
  return (
    <div data-department={department.themeKey}>
      <div className="mx-auto w-full max-w-[1920px] px-2 pt-6 sm:px-3 lg:px-4 xl:px-5">
        <h1 className="font-display text-[32px] font-semibold lg:text-[44px]">{department.name}</h1>
        {department.seo?.description ? <p className="mt-3 max-w-2xl text-ink-muted">{department.seo.description}</p> : null}
      </div>
      <CategoryGrid title="Top categories" department={department} limit={department.categories?.length || 12} />
      <ProductListing
        title=""
        pathname={`/${slug}`}
        searchParams={query}
        result={result}
        filters={DEFAULT_FILTERS}
        problem={problem}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: department.name, href: `/${slug}` },
        ]}
      />
    </div>
  );
}

export default function DepartmentPage({ params, searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <DepartmentContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
