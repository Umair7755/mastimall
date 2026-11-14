import { ProductCard } from "@/components/product/ProductCard";
import { Carousel } from "@/components/ui/Carousel";

const DEFAULT_ROW = "w-[72%] sm:w-[46%] md:w-[34%] lg:w-[23%] xl:w-[19%]";

export function ProductGrid({ products, layout = "grid", hot = false, itemClassName, dense = false }) {
  if (!products?.length) return null;
  if (layout === "row") {
    return (
      <Carousel
        itemClassName={itemClassName || DEFAULT_ROW}
        gapClassName={dense ? "gap-2 sm:gap-2.5" : undefined}
      >
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} hot={hot} index={index} compact={dense} />
        ))}
      </Carousel>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} hot={hot} index={index} />
      ))}
    </div>
  );
}
