import { Suspense } from "react";
import { connection } from "next/server";
import { OrderView } from "@/components/order/OrderView";
import { getOrder } from "@/lib/data";

export const metadata = { title: "Order", robots: { index: false, follow: false } };

async function OrderContent({ params, searchParams }) {
  await connection(); // always live — order status must not be cached
  const { orderNumber } = await params;
  const query = await searchParams;
  let order = null;
  let error = "";
  if (query.phone) {
    try {
      order = await getOrder(orderNumber, query.phone);
      if (!order) error = "Order not found. Check the number and the phone.";
    } catch (err) {
      error = err.message;
    }
  }
  return <OrderView orderNumber={orderNumber} order={order} error={error} placed={query.placed === "1"} />;
}

export default function OrderPage({ params, searchParams }) {
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-8 h-64 max-w-xl rounded-card" />}>
      <OrderContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
