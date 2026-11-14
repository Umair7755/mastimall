"use client";

import { useEffect, useState } from "react";
import { Ban, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  Badge,
  Card,
  PageHeader,
  Pagination,
} from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin";

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

function kindTone(kind) {
  if (kind === "user") return "indigo";
  if (kind === "guest") return "amber";
  if (kind === "phone") return "rose";
  if (kind === "email") return "slate";
  return "slate";
}

export default function AdminBlocklistPage() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function load({ nextQ = q, nextKind = kind, nextPage = page, nextLimit = limit } = {}) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(nextLimit),
      active: "1",
    });
    if (nextQ) params.set("q", nextQ);
    if (nextKind) params.set("kind", nextKind);
    try {
      setData(await adminFetch(`/admin/blocklist?${params}`));
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
  }, [page, limit, kind]);

  function search(event) {
    event.preventDefault();
    setPage(1);
    load({ nextPage: 1 });
  }

  async function unblock(row) {
    const ok = window.confirm(`Unblock this ${row.kind} entry?\n\n${row.label || row.value}`);
    if (!ok) return;
    setBusyId(row.id);
    try {
      await adminFetch(`/admin/blocklist/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <PageHeader
        title="Blocklist"
        description="One row per blocked account. Phone/email are still enforced from that account — no duplicate rows."
      />

      <Card className="mb-4 p-3">
        <form className="flex flex-wrap gap-2" onSubmit={search}>
          <AdminInput
            className="min-w-[220px] flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search value, label, reason…"
          />
          <AdminSelect
            className="w-40"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All kinds</option>
            <option value="user">User</option>
            <option value="guest">Guest</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
          </AdminSelect>
          <AdminButton type="submit" variant="secondary">
            Search
          </AdminButton>
        </form>
      </Card>

      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
      {loading && !data ? <p className="text-sm text-slate-500">Loading blocklist…</p> : null}

      <div className="grid gap-3">
        {(data?.items || []).length ? (
          data.items.map((row) => (
            <Card key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Ban size={14} className="text-rose-500" aria-hidden="true" />
                  <p className="text-sm font-semibold text-slate-900">{row.label || row.value}</p>
                  <Badge tone={kindTone(row.kind)}>{row.kind}</Badge>
                </div>
                <p className="mt-1 break-all text-xs text-slate-500">{row.value}</p>
                {row.reason ? <p className="mt-1 text-xs text-slate-600">{row.reason}</p> : null}
                <p className="mt-0.5 text-xs text-slate-400">Added {formatWhen(row.createdAt)}</p>
              </div>
              <AdminButton
                type="button"
                variant="secondary"
                className="inline-flex h-9 items-center gap-1.5 text-xs"
                disabled={busyId === row.id}
                onClick={() => unblock(row)}
              >
                <Trash2 size={13} strokeWidth={2.25} aria-hidden="true" />
                {busyId === row.id ? "Unblocking…" : "Unblock"}
              </AdminButton>
            </Card>
          ))
        ) : !loading ? (
          <Card className="px-4 py-10 text-center text-sm text-slate-500">
            No active blocks. Block from a user profile or a cart row.
          </Card>
        ) : null}
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
