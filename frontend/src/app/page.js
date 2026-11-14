import { StoreHome } from "@/components/home/StoreHome";
import { DEPARTMENT_MIX_WEIGHT } from "@/lib/finderGroups";
import { getDepartments, getProducts, loadShell } from "@/lib/data";

export const metadata = {
  title: { absolute: "Masti Mall" },
  description: "Toys + décor. Full masti. Bacchon ke toys aur ghar ka décor — cash on delivery across Pakistan.",
};

async function loadProducts(query) {
  try {
    const data = await getProducts(query);
    return data?.items || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [{ home }, departments] = await Promise.all([
    loadShell(),
    getDepartments().catch(() => []),
  ]);
  const heroSection = (home.sections || []).find((section) => section.type === "hero");
  const ordered = (departments.length ? departments : [{ slug: "toys", name: "Toys" }, { slug: "decor", name: "Decor" }]).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const [allBuckets, newArrivals] = await Promise.all([
    Promise.all(ordered.map((dept) => loadProducts(`department=${dept.slug}&limit=24&sort=new`))),
    loadProducts("isNew=1&limit=24&sort=new"),
  ]);

  const deptPayload = ordered.map((dept, index) => ({
    slug: dept.slug,
    name: dept.name,
    weight: DEPARTMENT_MIX_WEIGHT[dept.slug] ?? 0.2,
    all: allBuckets[index] || [],
  }));

  return (
    <StoreHome
      hero={{
        title: heroSection?.title || "Toys + décor. Full masti.",
        text: heroSection?.config?.text || "",
      }}
      departments={deptPayload}
      newArrivals={newArrivals}
    />
  );
}
