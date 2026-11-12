"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  Badge,
  Card,
  PageHeader,
  Pagination,
} from "@/components/admin/ui";
import { adminFetch, formatMoney } from "@/lib/admin";

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
  if (method === "cod") return "Cash on delivery";
  if (method === "bank") return "Bank transfer";
  return method || "—";
}

function paymentTone(method) {
  if (method === "jazzcash") return "rose";
  if (method === "easypaisa") return "green";
  return "slate";
}

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load({ nextQ = q, nextStatus = status, nextPage = page, nextLimit = limit } = {}) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(nextLimit),
    });
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("status", nextStatus);
    try {
      setData(await adminFetch(`/admin/orders?${params}`));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  async function updateStatus(id, nextStatus) {
    await adminFetch(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    load();
  }

  function search(event) {
    event.preventDefault();
    setPage(1);
    load({ nextPage: 1 });
  }

  return (
    <div>
      <PageHeader title="Orders" description="Track fulfillment and payments." />

      <Card className="mb-4 p-3">
        <form className="flex flex-wrap gap-2" onSubmit={search}>
          <AdminInput
            className="min-w-[220px] flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, phone, city…"
          />
          <AdminSelect
            className="w-44"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
              load({ nextStatus: e.target.value, nextPage: 1 });
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </AdminSelect>
          <AdminButton type="submit" variant="secondary">
            Search
          </AdminButton>
        </form>
      </Card>

      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-3">
        {loading && !data ? <p className="text-sm text-slate-500">Loading…</p> : null}
        {(data?.items || []).map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-900">{order.orderNumber}</p>
                  <Badge tone={tone(order.status)}>{order.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {order.customer?.name} · {order.customer?.phone} · {order.customer?.city}
                </p>
                <p className="mt-1 text-sm text-slate-600">{order.customer?.address}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold tabular-nums">{formatMoney(order.total)}</p>
                <div className="mt-1 flex justify-end">
                  <Badge tone={paymentTone(order.payment?.method)}>{paymentLabel(order.payment?.method)}</Badge>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {order.payment?.status || "pending"}
                </p>
              </div>
            </div>
            <ul className="mt-3 grid gap-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
              {(order.items || []).map((item, index) => (
                <li key={`${order.id}-${index}`}>
                  {item.qty} × {item.title}
                </li>
              ))}
            </ul>
            {order.payment?.receipt?.url ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment receipt</p>
                  <a
                    href={order.payment.receipt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Open full size
                  </a>
                </div>
                <a href={order.payment.receipt.url} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.payment.receipt.url}
                    alt={`Receipt for ${order.orderNumber}`}
                    className="max-h-56 w-full object-contain bg-white"
                  />
                </a>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">No payment receipt attached.</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AdminSelect
                className="w-52"
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    Mark {item}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </Card>
        ))}
        {data && !data.items.length ? <p className="text-sm text-slate-500">No orders found.</p> : null}
      </div>

      {data ? (
        <Card className="mt-4">
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        </Card>
      ) : null}
    </div>
  );
}
