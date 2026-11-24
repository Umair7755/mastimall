import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/product/BuyBox";
import { Gallery } from "@/components/product/Gallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentPurchaseBanner } from "@/components/product/RecentPurchaseBanner";
import { ReviewsPanel } from "@/components/product/ReviewsPanel";
import { StarRating } from "@/components/product/StarRating";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ListingSkeleton } from "@/components/ui/Skeleton";
import { getProduct, getProductSlugs } from "@/lib/data";
import { productPath } from "@/lib/paths";
import { absoluteUrl } from "@/lib/seo";

export async function generateStaticParams(context) {
  try {
    const parent = context?.params ? await context.params : {};
    const slugs = await getProductSlugs();
    const items = slugs.filter((item) => {
      if (parent.department && item.department !== parent.department) return false;
      if (parent.category && item.category !== parent.category) return false;
      return true;
    });
    if (!items.length) return [{ slug: "pending" }];
    if (!parent.category) {
      return items.map((item) => ({ department: item.department, category: item.category, slug: item.slug }));
    }
    return items.map((item) => ({ slug: item.slug }));
  } catch {
    return [{ slug: "pending" }];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProduct(slug).catch(() => null);
  const product = data?.product;
  if (!product) return { title: "Toy" };
  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description || "",
    alternates: { canonical: productPath(product) },
  };
}

async function ProductContent({ params }) {
  const { department, category, slug } = await params;
  const data = await getProduct(slug).catch(() => null);
  const product = data?.product;
  if (!product || product.department?.slug !== department || product.category?.slug !== category) notFound();
  const path = productPath(product);
  const reviews = data?.reviews || [];

  return (
    <div
      data-department={product.department?.themeKey}
      className="mx-auto w-full max-w-[1920px] px-2 py-6 pb-[calc(var(--mobile-chrome-bottom)+1.5rem)] sm:px-3 lg:px-4 xl:px-5 lg:pb-8"
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: product.department?.name || "Shop", href: `/${department}` },
          { label: product.category?.name || "Toys", href: `/${department}/${category}` },
          { label: product.title, href: path },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          sku: product.sku,
          image: (product.images || []).map((image) => absoluteUrl(image.url)),
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          aggregateRating:
            product.ratingCount > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.ratingAvg,
                  reviewCount: product.ratingCount,
                }
              : undefined,
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: product.currentPrice,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: absoluteUrl(path),
          },
        }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <Gallery product={product} />
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight sm:text-[32px] lg:text-[44px]">
            {product.title}
          </h1>
          {(product.ratingCount > 0 || product.ratingAvg > 0) ? (
            <div className="mt-3">
              <StarRating value={product.ratingAvg} count={product.ratingCount} size={18} />
            </div>
          ) : null}
          <div className="mt-4">
            <BuyBox product={product} />
          </div>
        </div>
      </div>
      <section className="mt-10 max-w-3xl">
        <h2 className="font-display text-2xl">About this toy</h2>
        {product.highlights?.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {product.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {product.description ? <p className="mt-4 whitespace-pre-wrap">{product.description}</p> : null}
      </section>

      <ReviewsPanel product={product} initialReviews={reviews} />

      {data.related?.length ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl lg:text-[32px]">Related toys</h2>
          <div className="mt-5">
            <ProductGrid products={data.related} />
          </div>
        </section>
      ) : null}

      <RecentPurchaseBanner productTitle={product.title} />
    </div>
  );
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
