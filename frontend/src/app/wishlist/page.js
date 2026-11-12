import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default function WishlistPage() {
  return <WishlistView />;
}
