"use client";

import { MessageCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useWishlistReady } from "@/hooks/useStoreReady";
import { productPath } from "@/lib/paths";
import { askParentWishlistMessage, openWhatsAppShare } from "@/lib/share";
import { useWishlist } from "@/store/wishlist";

export function WishlistView() {
  const ready = useWishlistReady();
  const items = useWishlist((state) => state.items);

  function share() {
    const origin = window.location.origin;
    const payload = items.map((item) => ({
      title: item.title,
      href: productPath(item),
    }));
    openWhatsAppShare(askParentWishlistMessage(payload, origin));
  }

  if (!ready) return <div className="skeleton mx-auto mt-8 h-64 w-full max-w-[1920px] rounded-card px-2 sm:px-3 lg:px-4" />;

  return (
    <div className="mx-auto w-full max-w-[1920px] px-2 py-6 sm:px-3 lg:px-4 xl:px-5">
      <h1 className="font-display text-[32px] font-semibold lg:text-[44px]">Wishlist</h1>
      {items.length ? (
        <>
          <Button variant="soft" className="mt-5" onClick={share}>
            <MessageCircle aria-hidden="true" />
            Send to Mom or Dad
          </Button>
          <div className="mt-6">
            <ProductGrid products={items} />
          </div>
        </>
      ) : (
        <div className="mt-6">
          <p className="font-display text-2xl">No toys saved yet. Tap the heart on a toy to remember it.</p>
          <ButtonLink href="/" className="mt-5">
            Browse toys
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
