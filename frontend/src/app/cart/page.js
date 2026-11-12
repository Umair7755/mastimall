import { CartContents } from "@/components/cart/CartContents";
import { loadShell } from "@/lib/data";

export const metadata = { title: "Cart", robots: { index: false, follow: false } };

export default async function CartPage() {
  const { departments } = await loadShell();
  const shopHref = departments[0] ? `/${departments[0].slug}` : "/";
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-[32px] font-semibold lg:text-[44px]">Your cart</h1>
      <CartContents shopHref={shopHref} />
    </div>
  );
}
