import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DepartmentHome } from "@/components/home/DepartmentHome";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { getDepartment, getDepartments, getProducts } from "@/lib/data";

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

async function loadProducts(query) {
  try {
    const data = await getProducts(query);
    return data?.items || [];
  } catch {
    return [];
  }
}

async function DepartmentContent({ params }) {
  const { department: slug } = await params;
  const data = await getDepartment(slug).catch(() => null);
  if (!data?.department) notFound();
  const department = data.department;

  const [all, newArrivals] = await Promise.all([
    loadProducts(`department=${slug}&limit=48&sort=popular`),
    loadProducts(`department=${slug}&isNew=1&limit=24&sort=new`),
  ]);

  return <DepartmentHome department={department} all={all} newArrivals={newArrivals} />;
}

export default function DepartmentPage({ params }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <DepartmentContent params={params} />
    </Suspense>
  );
}
