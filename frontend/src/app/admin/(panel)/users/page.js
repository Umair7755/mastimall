"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  Badge,
  Card,
  DataTable,
  PageHeader,
  Pagination,
  StatCard,
} from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin";
import { cn } from "@/lib/cn";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

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
    setBusyId(`role-${id}`);
    setError("");
    try {
      await adminFetch(`/admin/customers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      await load();
    } catch (err) {
      setError(err.message || "Could not update role");
    } finally {
      setBusyId("");
    }
  }

  async function toggleBlock(row) {
    if (row.role === "admin") return;
    const nextBlocked = !row.blocked;
    const ok = window.confirm(
      nextBlocked
        ? `Block ${row.name || row.email || "this user"}?\n\nThey will see a blacklist popup and cannot shop.`
        : `Unblock ${row.name || row.email || "this user"}?`
    );
    if (!ok) return;
    setBusyId(row.id);
    setError("");
    try {
      await adminFetch(
        nextBlocked ? `/admin/customers/${row.id}/block` : `/admin/customers/${row.id}/unblock`,
        { method: "POST", body: JSON.stringify({}) }
      );
      await load();
    } catch (err) {
      setError(err.message || "Could not update block status");
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
      key: "user",
      label: "User",
      render: (row) => (
        <div className="min-w-[160px]">
          <p className="font-semibold text-slate-900">{row.name || "—"}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{row.email || "—"}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => <span className="tabular-nums text-slate-600">{row.phone || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) =>
        row.blocked ? <Badge tone="rose">Blocked</Badge> : <Badge tone="green">Active</Badge>,
    },
    {
      key: "orders",
      label: "Orders",
      render: (row) => (
        <span className="font-semibold tabular-nums text-slate-900">{row.orderCount || 0}</span>
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
      key: "role",
      label: "Role",
      render: (row) => (
        <AdminSelect
          className="h-8 w-[7.5rem] text-xs"
          value={row.role}
          disabled={busyId === `role-${row.id}`}
          onChange={(e) => setUserRole(row.id, e.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </AdminSelect>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const blocking = busyId === row.id;
        return (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Link href={`/admin/users/${row.id}`} className="text-xs font-semibold text-indigo-600 hover:underline">
              History
            </Link>
            {row.role !== "admin" ? (
              <button
                type="button"
                disabled={blocking}
                onClick={() => toggleBlock(row)}
                className={cn(
                  "text-xs font-semibold disabled:opacity-50",
                  row.blocked ? "text-emerald-700 hover:underline" : "text-rose-600 hover:underline"
                )}
              >
                {blocking ? "…" : row.blocked ? "Unblock" : "Block"}
              </button>
            ) : null}
          </div>
        );
      },
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

      {data?.stats ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Customers"
            value={data.stats.customerCount ?? 0}
            hint={`${data.stats.adminCount ?? 0} admins`}
            tone="indigo"
          />
          <StatCard
            label="New today"
            value={data.stats.newToday ?? 0}
            hint="Accounts created today"
            tone="emerald"
          />
          <StatCard
            label="Store visits today"
            value={data.stats.visitsToday ?? 0}
            hint="Unique shoppers who opened the store"
            tone="sky"
          />
          <StatCard
            label="Signed-in visits today"
            value={data.stats.signedInVisitsToday ?? 0}
            hint="Logged-in users who visited today"
            tone="amber"
          />
        </div>
      ) : null}

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
