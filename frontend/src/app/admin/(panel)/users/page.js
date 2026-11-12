"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, RefreshCw } from "lucide-react";
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
import { adminFetch } from "@/lib/admin";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load({ nextQ = q, nextRole = role, nextPage = page, nextLimit = limit } = {}) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(nextLimit),
      _t: String(Date.now()),
    });
    if (nextQ) params.set("q", nextQ);
    if (nextRole) params.set("role", nextRole);
    try {
      setData(await adminFetch(`/admin/customers?${params}`));
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

  async function setUserRole(id, nextRole) {
    await adminFetch(`/admin/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role: nextRole }),
    });
    load();
  }

  function search(event) {
    event.preventDefault();
    setPage(1);
    load({ nextPage: 1 });
  }

  const columns = [
    {
      key: "user",
      label: "User",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name || "—"}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    { key: "phone", label: "Phone", render: (row) => row.phone || "—" },
    {
      key: "role",
      label: "Role",
      render: (row) => <Badge tone={row.role === "admin" ? "indigo" : "slate"}>{row.role}</Badge>,
    },
    { key: "wishlistCount", label: "Wishlist" },
    {
      key: "orders",
      label: "Orders",
      render: (row) => (
        <div>
          <p className="font-semibold tabular-nums text-slate-900">{row.orderCount || 0}</p>
          {(row.cancelledCount || 0) > 0 ? (
            <p className="text-[11px] font-semibold text-rose-600">{row.cancelledCount} cancelled</p>
          ) : (
            <p className="text-[11px] text-slate-400">No cancels</p>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/users/${row.id}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <History size={13} />
            History
          </Link>
          <AdminSelect
            className="w-36"
            value={row.role}
            onChange={(e) => setUserRole(row.id, e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </AdminSelect>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Live from the database — admins first, then newest signups."
        actions={
          <AdminButton type="button" variant="secondary" onClick={() => load()} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : undefined} />
            Refresh
          </AdminButton>
        }
      />

      <Card className="mb-4 p-3">
        <form className="flex flex-wrap gap-2" onSubmit={search}>
          <AdminInput
            className="min-w-[220px] flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
          />
          <AdminSelect
            className="w-44"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
              load({ nextRole: e.target.value, nextPage: 1 });
            }}
          >
            <option value="">All roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </AdminSelect>
          <AdminButton type="submit" variant="secondary">
            Search
          </AdminButton>
        </form>
      </Card>

      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}

      <Card>
        {loading && !data ? <p className="px-4 py-8 text-center text-sm text-slate-500">Loading…</p> : null}
        {data ? (
          <>
            <DataTable columns={columns} rows={data.items} empty="No users found." />
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
