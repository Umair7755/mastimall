"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductReviewsManager } from "@/components/admin/ProductReviewsManager";
import { PageHeader } from "@/components/admin/ui";

export default function AdminEditProductPage({ params }) {
  const { id } = use(params);
  return (
    <div>
      <PageHeader
        title="Edit product"
        description="Update stock, price, status, details, and manage ratings & reviews."
      />
      <ProductForm productId={id} />
      <ProductReviewsManager productId={id} />
    </div>
  );
}
