import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AudienceTiles } from "@/components/home/AudienceTiles";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { AUDIENCES, DEFAULT_FILTERS } from "@/lib/constants";
import { getDepartments, getProducts } from "@/lib/data";
import { productQuery } from "@/lib/paths";

export function generateStaticParams() {
  return AUDIENCES.map((item) => ({ audience: item.slug }));
}

export async function generateMetadata({ params }) {
  const { audience } = await params;
  const match = AUDIENCES.find((item) => item.slug === audience);
  if (!match) return { title: "Shop" };
  return { title: match.label, description: `Toys for ${match.label.toLowerCase()}.`, alternates: { canonical: `/for/${audience}` } };
}

async function AudienceContent({ params, searchParams }) {
  const { audience } = await params;
  const match = AUDIENCES.find((item) => item.slug === audience);
  if (!match) notFound();
  const query = await searchParams;
  const departments = await getDepartments().catch(() => []);
  const categories = departments.flatMap((department) =>
    (department.categories || []).map((category) => ({ ...category, href: `/${department.slug}/${category.slug}` }))
  );
  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result = (await getProducts(productQuery({ audience, excludeAdult: true, searchParams: query }))) || result;
  } catch (error) {
    problem = error.message;
  }
  return (
    <>
      <AudienceTiles title="Who is it for?" />
      <ProductListing
        title={match.label}
        intro="Pictures first. Toys marked only for ages 12 and up stay in their own category."
        pathname={`/for/${audience}`}
        searchParams={query}
        result={result}
        filters={DEFAULT_FILTERS}
        categories={categories}
        problem={problem}
        hideAdult
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: match.label, href: `/for/${audience}` },
        ]}
      />
    </>
  );
}

export default function AudiencePage({ params, searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <AudienceContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
