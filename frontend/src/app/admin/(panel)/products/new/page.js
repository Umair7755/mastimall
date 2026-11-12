import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export default function AdminNewProductPage() {
  return (
    <div>
      <PageHeader title="Add product" description="Create a new toy or décor item." />
      <ProductForm />
    </div>
  );
}
