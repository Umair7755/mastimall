"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SalesAreaChart, StatusPieChart, TopProductsChart } from "@/components/admin/Charts";
import { Badge, Card, CardHeader, PageHeader, StatCard } from "@/components/admin/ui";
import { adminFetch, formatMoney } from "@/lib/admin";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/admin/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading dashboard…</p>;

  const s = data.summary;

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Dashboard"
        description="Live sales, catalog health and recent activity."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Add product
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatMoney(s.revenue)} hint="Counted after delivery only" tone="indigo" />
        <StatCard label="Today revenue" value={formatMoney(s.todayRevenue)} hint={`${s.todayOrders} orders today`} tone="emerald" />
        <StatCard label="Total orders" value={s.orderCount} hint={`Avg ${formatMoney(s.avgOrderValue)} (delivered)`} tone="sky" />
        <StatCard label="Customers" value={s.customerCount} hint={`${s.adminCount} admins`} tone="amber" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active products" value={s.activeProducts} hint={`${s.productCount} total`} tone="indigo" />
        <StatCard label="Draft products" value={s.draftProducts} tone="slate" />
        <StatCard label="Low stock" value={s.lowStock} hint="1–5 units left" tone="amber" />
        <StatCard label="Out of stock" value={s.outOfStock} hint={`${s.archivedProducts} archived`} tone="rose" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <SalesAreaChart data={data.salesByDay} />
        <StatusPieChart data={data.ordersByStatus} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TopProductsChart data={data.topProducts} />

        <Card>
          <CardHeader
            title="Recent orders"
            description="Latest checkouts"
            action={
              <Link href="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:underline">
                View all
              </Link>
            }
          />
          <div className="divide-y divide-slate-100">
            {(data.recentOrders || []).length ? (
              data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="truncate text-xs text-slate-500">
                      {order.customer?.name || "Guest"} · {order.customer?.city || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatMoney(order.total)}</p>
                    <Badge tone="indigo">{order.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No orders yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
