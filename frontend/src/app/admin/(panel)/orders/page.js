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
  StatCard,
} from "@/components/admin/ui";
import { adminFetch, formatMoney } from "@/lib/admin";
import { refreshAdminBadges } from "@/lib/adminEvents";
import { cn } from "@/lib/cn";

const STATUSES = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];
const ADVANCE_FILTERS = [
  { value: "", label: "All advance plans" },
  { value: "none", label: "COD only" },
  { value: "25", label: "Advance 25%" },
  { value: "50", label: "Advance 50%" },
  { value: "100", label: "Advance 100%" },
];

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

function statusLabel(status) {
  if (status === "new") return "New";
  if (status === "confirmed") return "Confirmed";
  if (status === "packed") return "Packed";
  if (status === "shipped") return "Shipped";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  if (status === "returned") return "Returned";
  return status;
}

function advanceLabel(plan) {
  if (!plan || plan === "none") return "COD";
  return `Advance ${plan}%`;
}

function advanceTone(plan) {
  if (plan === "100") return "emerald";
  if (plan === "50") return "indigo";
  if (plan === "25") return "amber";
  return "slate";
}

function advanceStatusLabel(status) {
  if (status === "verified") return "Advance verified";
  if (status === "rejected") return "Advance rejected";
  if (status === "pending") return "Advance pending";
  return "";
}

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [advancePlan, setAdvancePlan] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load({
    nextQ = q,
    nextStatus = status,
    nextAdvance = advancePlan,
    nextPage = page,
    nextLimit = limit,
  } = {}) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(nextLimit),
      _t: String(Date.now()),
    });
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("status", nextStatus);
    if (nextAdvance) params.set("advancePlan", nextAdvance);
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
    refreshAdminBadges();
    load();
  }

  async function updateAdvance(id, nextAdvanceStatus) {
    await adminFetch(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ advanceStatus: nextAdvanceStatus }),
    });
    refreshAdminBadges();
    load();
  }

  async function updatePayment(id, nextPaymentStatus) {
    await adminFetch(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus: nextPaymentStatus }),
    });
    refreshAdminBadges();
    load();
  }

  function search(event) {
    event.preventDefault();
    setPage(1);
    load({ nextPage: 1 });
  }

  function filterByStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
    load({ nextStatus, nextPage: 1 });
  }

  function filterByAdvance(nextAdvance) {
    setAdvancePlan(nextAdvance);
    setPage(1);
    load({ nextAdvance, nextPage: 1 });
  }

  const stats = data?.stats || {};

  return (
    <div>
      <PageHeader title="Orders" description="Track fulfillment, advance payments, and receipts." />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button type="button" className="cursor-pointer text-left" onClick={() => filterByStatus("")}>
          <StatCard
            label="All orders"
            value={stats.all ?? 0}
            hint={`${stats.today ?? 0} placed today`}
            tone={!status ? "indigo" : "slate"}
          />
        </button>
        <button type="button" className="cursor-pointer text-left" onClick={() => filterByStatus("new")}>
          <StatCard
            label="New"
            value={stats.new ?? 0}
            hint="Waiting for confirmation"
            tone={status === "new" ? "amber" : "slate"}
          />
        </button>
        <StatCard
          label="Advance pending"
          value={stats.advancePending ?? 0}
          hint="Receipts to verify"
          tone="amber"
        />
        <StatCard
          label="Today sales"
          value={formatMoney(stats.todaySales ?? 0)}
          hint="Excludes cancelled"
          tone="emerald"
        />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Advance collected"
          value={formatMoney(stats.advanceCollected ?? 0)}
          hint="From 25/50/100% plans"
          tone="emerald"
        />
        <StatCard
          label="Discounts given"
          value={formatMoney(stats.discountGiven ?? 0)}
          hint="Product discounts only"
          tone="indigo"
        />
        <button type="button" className="cursor-pointer text-left" onClick={() => filterByAdvance("25")}>
          <StatCard label="Plan 25%" value={stats.byAdvance?.["25"] ?? 0} hint="5% off" tone={advancePlan === "25" ? "amber" : "slate"} />
        </button>
        <button type="button" className="cursor-pointer text-left" onClick={() => filterByAdvance("100")}>
          <StatCard label="Plan 100%" value={stats.byAdvance?.["100"] ?? 0} hint="15% off" tone={advancePlan === "100" ? "emerald" : "slate"} />
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { key: "packed", tone: "indigo", hint: "Being prepared" },
          { key: "shipped", tone: "indigo", hint: "With courier" },
          { key: "delivered", tone: "emerald", hint: "Completed" },
          { key: "cancelled", tone: "rose", hint: "Not fulfilled" },
          { key: "returned", tone: "rose", hint: "Sent back" },
        ].map((item) => (
          <button key={item.key} type="button" className="cursor-pointer text-left" onClick={() => filterByStatus(item.key)}>
            <StatCard
              label={statusLabel(item.key)}
              value={stats[item.key] ?? 0}
              hint={item.hint}
              tone={status === item.key ? item.tone : "slate"}
            />
          </button>
        ))}
      </div>

      <Card className="mb-4 p-3">
        <form className="flex flex-wrap gap-2" onSubmit={search}>
          <AdminInput
            className="min-w-[220px] flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, phone, city…"
          />
          <AdminSelect className="w-44" value={status} onChange={(e) => filterByStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect className="w-48" value={advancePlan} onChange={(e) => filterByAdvance(e.target.value)}>
            {ADVANCE_FILTERS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
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
        {(data?.items || []).map((order) => {
          const plan = order.payment?.advancePlan || "none";
          const hasAdvance = plan !== "none";
          return (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-slate-900">{order.orderNumber}</p>
                    <Badge tone={tone(order.status)}>{statusLabel(order.status)}</Badge>
                    <Badge tone={advanceTone(plan)}>{advanceLabel(plan)}</Badge>
                    {hasAdvance && order.payment?.advanceStatus ? (
                      <Badge tone={order.payment.advanceStatus === "verified" ? "green" : order.payment.advanceStatus === "rejected" ? "rose" : "amber"}>
                        {advanceStatusLabel(order.payment.advanceStatus)}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.customer?.name} · {order.customer?.phone} · {order.customer?.city}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{order.customer?.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold tabular-nums">{formatMoney(order.total)}</p>
                  {hasAdvance ? (
                    <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                      <p>
                        Discount −{formatMoney(order.payment?.discountAmount || 0)} ({order.payment?.discountPercent || 0}%)
                      </p>
                      <p className="font-semibold text-emerald-700">
                        Advance {formatMoney(order.payment?.advanceAmount || 0)}
                      </p>
                      <p>Balance {formatMoney(order.payment?.balanceAmount || 0)}</p>
                    </div>
                  ) : null}
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {hasAdvance ? "Advance payment receipt" : "Payment receipt"}
                    </p>
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
                      className="max-h-56 w-full bg-white object-contain"
                    />
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">
                  {hasAdvance ? "Advance receipt missing." : "No payment receipt attached."}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AdminSelect
                  className={cn("w-52")}
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      Mark {statusLabel(item)}
                    </option>
                  ))}
                </AdminSelect>
                {hasAdvance ? (
                  <>
                    <AdminButton
                      type="button"
                      variant="secondary"
                      onClick={() => updateAdvance(order.id, "verified")}
                      disabled={order.payment?.advanceStatus === "verified"}
                    >
                      Verify advance
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="secondary"
                      onClick={() => updateAdvance(order.id, "rejected")}
                      disabled={order.payment?.advanceStatus === "rejected"}
                    >
                      Reject advance
                    </AdminButton>
                    {order.payment?.balanceAmount > 0 ? (
                      <AdminButton type="button" variant="secondary" onClick={() => updatePayment(order.id, "paid")}>
                        Mark fully paid
                      </AdminButton>
                    ) : null}
                  </>
                ) : (
                  <AdminButton type="button" variant="secondary" onClick={() => updatePayment(order.id, "paid")}>
                    Mark paid
                  </AdminButton>
                )}
              </div>
            </Card>
          );
        })}
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
