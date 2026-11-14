"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  SalesAreaChart,
  StatusPieChart,
  TopProductsChart,
  VisitsAreaChart,
} from "@/components/admin/Charts";
import { Badge, Card, CardHeader, PageHeader, StatCard } from "@/components/admin/ui";
import { adminFetch, formatMoney } from "@/lib/admin";

function formatWhen(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-PK", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

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
        description="Live sales, visitors, abandoned carts and catalog health."
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
        <StatCard
          label="Visits today"
          value={s.visitsToday ?? 0}
          hint="Unique browsers today"
          tone="emerald"
        />
        <StatCard
          label="Visits all time"
          value={s.visitsAllTime ?? 0}
          hint="Unique visitor-days"
          tone="sky"
        />
        <StatCard
          label="Left without buying"
          value={s.abandonedCarts ?? 0}
          hint="Shoppers (not items) · idle 2h+"
          tone="rose"
        />
        <StatCard
          label="Shopping now"
          value={s.openCarts ?? 0}
          hint="Shoppers with items, not ordered yet"
          tone="amber"
        />
      </div>

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
        <VisitsAreaChart data={data.visitsByDay || []} />
        <StatusPieChart data={data.ordersByStatus} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <SalesAreaChart data={data.salesByDay} />
        <TopProductsChart data={data.topProducts} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Left without buying"
            description="Shoppers who added items but did not order (idle 2h+)"
            action={
              <Link href="/admin/carts" className="text-xs font-semibold text-indigo-600 hover:underline">
                Open carts
              </Link>
            }
          />
          <div className="divide-y divide-slate-100">
            {(data.abandonedCartList || []).length ? (
              data.abandonedCartList.map((cart) => {
                const contact =
                  cart.contact?.phone || cart.contact?.email || cart.contact?.name
                    ? [cart.contact?.name, cart.contact?.phone, cart.contact?.email]
                        .filter(Boolean)
                        .join(" · ")
                    : cart.registered
                      ? "Registered (no contact on file)"
                      : "Guest · no contact yet";
                const titles = (cart.items || [])
                  .map((item) => `${item.title} ×${item.qty}`)
                  .join(", ");
                return (
                  <div key={cart.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
                        {cart.registered ? " · account" : " · guest"}
                      </p>
                      <p className="truncate text-xs text-slate-500">{contact}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{titles || "—"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500">{formatWhen(cart.lastSeenAt)}</p>
                      <Badge tone="rose">Abandoned</Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No abandoned carts yet.{" "}
                <Link href="/admin/carts?kind=open" className="font-semibold text-indigo-600 hover:underline">
                  See open carts
                </Link>
              </p>
            )}
          </div>
        </Card>

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
