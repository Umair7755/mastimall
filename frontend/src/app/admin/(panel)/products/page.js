"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  Badge,
  Card,
  DataTable,
  PageHeader,
  Pagination,
} from "@/components/admin/ui";
import { adminFetch, adminMutate, formatMoney } from "@/lib/admin";
import { cn } from "@/lib/cn";

function ActionBtn({ href, onClick, disabled, tone = "slate", children, title }) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    amber: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  };
  const className = cn(
    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
    tones[tone] || tones.slate
  );

  if (href) {
    return (
      <Link href={href} className={className} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} title={title}>
      {children}
    </button>
  );
}

function statusTone(status) {
  if (status === "active") return "green";
  if (status === "draft") return "amber";
  return "slate";
}

function statusLabel(status) {
  if (status === "active") return "Visible";
  if (status === "draft") return "Hidden";
  if (status === "archived") return "Archived";
  return status;
}

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function load({ nextQ = q, nextStatus = status, nextPage = page, nextLimit = limit } = {}) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(nextLimit),
    });
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("status", nextStatus);
    try {
      setData(await adminFetch(`/admin/products?${params}`));
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

  async function setVisibility(row, nextStatus) {
    const hide = nextStatus === "draft";
    const ok = window.confirm(
      hide
        ? `Hide “${row.title}” from the store? Shoppers will not see it until you show it again.`
        : `Show “${row.title}” on the store again?`
    );
    if (!ok) return;
    setBusyId(row.id);
    try {
      await adminMutate(
        `/admin/products/${row.id}`,
        { method: "PATCH", body: JSON.stringify({ status: nextStatus }) },
        ["products", "home", "departments", `product:${row.slug}`]
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function removeProduct(row) {
    const ok = window.confirm(
      `Permanently remove “${row.title}”?\n\nThis deletes it from the store and admin. This cannot be undone.`
    );
    if (!ok) return;
    setBusyId(row.id);
    try {
      await adminMutate(`/admin/products/${row.id}`, { method: "DELETE" }, [
        "products",
        "home",
        "departments",
        `product:${row.slug}`,
      ]);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  function search(event) {
    event.preventDefault();
    setPage(1);
    load({ nextPage: 1 });
  }

  const columns = [
    {
      key: "title",
      label: "Product",
      render: (row) => {
        const imageUrl = row.images?.[0]?.url || "";
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/admin/products/${row.id}`}
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              aria-label={`Edit ${row.title}`}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  No img
                </span>
              )}
            </Link>
            <div className="min-w-0">
              <Link
                href={`/admin/products/${row.id}`}
                className="block truncate font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
              >
                {row.title}
              </Link>
              <p className="truncate text-xs text-slate-500">{row.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      render: (row) => formatMoney(row.currentPrice ?? row.price),
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) =>
        row.ratingCount > 0 ? (
          <div>
            <p className="font-semibold tabular-nums text-slate-900">{Number(row.ratingAvg || 0).toFixed(1)} ★</p>
            <p className="text-[11px] text-slate-500">{row.ratingCount} reviews</p>
          </div>
        ) : (
          <span className="text-xs text-slate-400">No reviews</span>
        ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) => (
        <span className={row.stock <= 5 ? "font-semibold text-amber-600" : ""}>{row.stock}</span>
      ),
    },
    {
      key: "status",
      label: "Store",
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const busy = busyId === row.id;
        const visible = row.status === "active";
        return (
          <div className="inline-flex flex-wrap items-center gap-1.5">
            <ActionBtn href={`/admin/products/${row.id}`} tone="indigo" title="Edit product">
              <Pencil size={13} strokeWidth={2.25} aria-hidden="true" />
              Edit
            </ActionBtn>
            {visible ? (
              <ActionBtn
                tone="amber"
                disabled={busy}
                title="Hide from store"
                onClick={() => setVisibility(row, "draft")}
              >
                <EyeOff size={13} strokeWidth={2.25} aria-hidden="true" />
                Hide
              </ActionBtn>
            ) : (
              <ActionBtn
                tone="emerald"
                disabled={busy}
                title="Show on store"
                onClick={() => setVisibility(row, "active")}
              >
                <Eye size={13} strokeWidth={2.25} aria-hidden="true" />
                Show
              </ActionBtn>
            )}
            <ActionBtn
              tone="rose"
              disabled={busy}
              title="Remove permanently"
              onClick={() => removeProduct(row)}
            >
              <Trash2 size={13} strokeWidth={2.25} aria-hidden="true" />
              Remove
            </ActionBtn>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Hide keeps the product in admin. Remove deletes it from the store forever."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus size={16} aria-hidden="true" />
            Add product
          </Link>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <form onSubmit={search} className="grid gap-3 p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <AdminInput
                className="h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-10 pr-3 shadow-none focus:bg-white"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, slug, or brand…"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <AdminSelect
                className="h-11 w-full shrink-0 sm:w-52 [&_select]:h-11 [&_select]:rounded-xl"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                  load({ nextStatus: e.target.value, nextPage: 1 });
                }}
              >
                <option value="">All products</option>
                <option value="active">Visible on store</option>
                <option value="draft">Hidden from store</option>
                <option value="archived">Archived</option>
              </AdminSelect>

              <AdminButton type="submit" className="h-11 w-full shrink-0 rounded-xl px-5 sm:w-auto">
                <Search size={15} aria-hidden="true" />
                Search
              </AdminButton>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Quick filter
            </span>
            {[
              { value: "", label: "All" },
              { value: "active", label: "Visible" },
              { value: "draft", label: "Hidden" },
              { value: "archived", label: "Archived" },
            ].map((chip) => {
              const active = status === chip.value;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setStatus(chip.value);
                    setPage(1);
                    load({ nextStatus: chip.value, nextPage: 1 });
                  }}
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-semibold transition",
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </form>
      </Card>

      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}

      <Card>
        {loading && !data ? <p className="px-4 py-8 text-center text-sm text-slate-500">Loading…</p> : null}
        {data ? (
          <>
            <DataTable columns={columns} rows={data.items} empty="No products found." />
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
          </>
        ) : null}
      </Card>
    </div>
  );
}
