"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Ban, PackageCheck, RotateCcw, ShoppingBag } from "lucide-react";
import { StatusPieChart, UserOrdersTrendChart } from "@/components/admin/Charts";
import {
  AdminSelect,
  Badge,
  Card,
  CardHeader,
  PageHeader,
  Pagination,
  StatCard,
} from "@/components/admin/ui";
import { adminFetch, formatMoney } from "@/lib/admin";
import { cn } from "@/lib/cn";

const STATUSES = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

function tone(status) {
  if (status === "delivered") return "green";
  if (status === "cancelled" || status === "returned") return "rose";
  if (status === "shipped" || status === "packed") return "indigo";
  if (status === "confirmed") return "amber";
  return "slate";
}

function paymentLabel(method) {
  if (method === "jazzcash") return "JazzCash";
  if (method === "easypaisa") return "EasyPaisa";
  if (method === "cod") return "COD";
  return method || "—";
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load({ nextStatus = status, nextPage = page, nextLimit = limit } = {}) {
    if (!id) return;
    setLoading(true);
    const paramsQs = new URLSearchParams({
      page: String(nextPage),
      limit: String(nextLimit),
    });
    if (nextStatus) paramsQs.set("status", nextStatus);
    try {
      setData(await adminFetch(`/admin/customers/${id}?${paramsQs}`));
      setError("");
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, limit, status]);

  if (loading && !data) {
    return <p className="text-sm text-slate-500">Loading user order history…</p>;
  }

  if (error && !data) {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-rose-600">{error}</p>
        <Link href="/admin/users" className="text-sm font-semibold text-indigo-600 hover:underline">
          ← Back to users
        </Link>
      </div>
    );
  }

  const customer = data.customer;
  const summary = data.summary || {};

  return (
    <div className="grid gap-5">
      <PageHeader
        title={customer.name || "Customer"}
        description={`${customer.email || "—"}${customer.phone ? ` · ${customer.phone}` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/users"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              Users
            </Link>
            <Badge tone={customer.role === "admin" ? "indigo" : "slate"}>{customer.role}</Badge>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={summary.orderCount || 0} hint="All statuses" tone="indigo" />
        <StatCard
          label="Cancelled"
          value={summary.cancelledCount || 0}
          hint="Track repeat cancellations"
          tone="rose"
        />
        <StatCard label="Delivered" value={summary.deliveredCount || 0} hint={`${summary.returnedCount || 0} returned`} tone="emerald" />
        <StatCard
          label="Revenue"
          value={formatMoney(summary.revenue)}
          hint={`Delivered only · avg ${formatMoney(summary.avgOrderValue)}`}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <UserOrdersTrendChart data={data.salesByDay || []} />
        <StatusPieChart data={data.ordersByStatus || []} />
      </div>

      <Card>
        <CardHeader
          title="Cancelled orders"
          description="Exact cancelled order history for this user"
          action={
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
              <Ban size={13} />
              {summary.cancelledCount || 0} cancelled
            </span>
          }
        />
        <div className="divide-y divide-slate-100">
          {(data.cancelledOrders || []).length ? (
            data.cancelledOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}{" "}
                    · {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"} ·{" "}
                    {paymentLabel(order.payment?.method)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{formatMoney(order.total)}</p>
                  <Badge tone="rose">cancelled</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No cancelled orders for this user.</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Full order history"
          description="Table of every order linked to this account / phone"
          action={
            <AdminSelect
              className="w-44"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </AdminSelect>
          }
        />

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.orders?.items || []).map((order) => (
                <tr key={order.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{order.customer?.city || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <ul className="grid gap-0.5">
                      {(order.items || []).slice(0, 3).map((item, index) => (
                        <li key={`${order.id}-${index}`} className="truncate max-w-[220px]">
                          {item.qty} × {item.title}
                        </li>
                      ))}
                      {(order.items || []).length > 3 ? (
                        <li className="text-xs text-slate-400">+{(order.items || []).length - 3} more</li>
                      ) : null}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{paymentLabel(order.payment?.method)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatMoney(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone(order.status)}>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.orders?.items?.length ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No orders match this filter.</p>
          ) : null}
        </div>

        {data.orders ? (
          <Pagination
            page={data.orders.page}
            pages={data.orders.pages}
            total={data.orders.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        ) : null}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShoppingBag size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Orders</p>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">{summary.orderCount || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <PackageCheck size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Delivered</p>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">{summary.deliveredCount || 0}</p>
        </Card>
        <Card className="p-4">
          <div className={cn("flex items-center gap-2", summary.cancelledCount ? "text-rose-600" : "text-slate-500")}>
            <RotateCcw size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Cancel rate</p>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">
            {summary.orderCount
              ? `${Math.round(((summary.cancelledCount || 0) / summary.orderCount) * 100)}%`
              : "0%"}
          </p>
        </Card>
      </div>
    </div>
  );
}
