import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return <CheckoutForm />;
}
