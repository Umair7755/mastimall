import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AgePicker } from "@/components/home/AgePicker";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { AGE_BANDS, DEFAULT_FILTERS } from "@/lib/constants";
import { getDepartments, getProducts } from "@/lib/data";
import { productQuery } from "@/lib/paths";

export function generateStaticParams() {
  return AGE_BANDS.map((item) => ({ band: item.slug }));
}

export async function generateMetadata({ params }) {
  const { band } = await params;
  const match = AGE_BANDS.find((item) => item.slug === band);
  if (!match) return { title: "Age" };
  return { title: `Ages ${match.label}`, description: `Toys for ages ${match.label}.`, alternates: { canonical: `/age/${band}` } };
}

async function AgeContent({ params, searchParams }) {
  const { band } = await params;
  const match = AGE_BANDS.find((item) => item.slug === band);
  if (!match) notFound();
  const query = await searchParams;
  const departments = await getDepartments().catch(() => []);
  const categories = departments.flatMap((department) =>
    (department.categories || []).map((category) => ({ ...category, href: `/${department.slug}/${category.slug}` }))
  );
  let result = { items: [], total: 0, page: 1, pages: 0 };
  let problem = "";
  try {
    result =
      (await getProducts(
        productQuery({ age: band, excludeAdult: band !== "12-plus", searchParams: query })
      )) || result;
  } catch (error) {
    problem = error.message;
  }
  return (
    <>
      <AgePicker title="Pick an age" />
      <ProductListing
        title={`Ages ${match.label}`}
        pathname={`/age/${band}`}
        searchParams={query}
        result={result}
        filters={DEFAULT_FILTERS}
        categories={categories}
        problem={problem}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: `Ages ${match.label}`, href: `/age/${band}` },
        ]}
      />
    </>
  );
}

export default function AgePage({ params, searchParams }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <AgeContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
