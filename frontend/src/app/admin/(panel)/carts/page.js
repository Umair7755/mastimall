"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

function storeBaseUrl() {
  const fromEnv = String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "https://mastimall.com";
}

function cartResumeUrl(cart) {
  const token = String(cart?.resumeToken || "").trim();
  if (!token) return `${storeBaseUrl()}/cart`;
  return `${storeBaseUrl()}/cart?resume=${encodeURIComponent(token)}`;
}

function whatsappHref(phone, cart) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const pk = digits.startsWith("92") ? digits : digits.replace(/^0/, "92");
  const name = String(cart.contact?.name || "").trim();
  const lines = (cart.items || []).slice(0, 6).map((item) => `• ${item.title} (×${item.qty})`);
  const more =
    (cart.items || []).length > 6 ? `\n• …and ${(cart.items || []).length - 6} more` : "";
  const itemBlock = lines.length ? `\n\n${lines.join("\n")}${more}` : "";
  const greeting = name ? `Assalam o Alaikum ${name},` : "Assalam o Alaikum,";
  const resumeUrl = cartResumeUrl(cart);
  const text = encodeURIComponent(
    `${greeting}

Masti Mall se khush aamdeed.

Aap ne yeh cheezein apni cart mein add ki thin:${itemBlock}

Apni cart yahan se kholen (items wahan mil jayengi):
${resumeUrl}

Agar aap chahein to hum aapke liye order complete karne mein madad kar sakte hain — aur ek chhoti si discount bhi offer kar sakte hain.

Jawab dein, hum khushi se guide karenge.

Shukriya,
Masti Mall Team`
  );
  return `https://wa.me/${pk}?text=${text}`;
}

function AdminCartsPageInner() {
  const searchParams = useSearchParams();
  const initialKind = ["abandoned", "open", "all"].includes(searchParams.get("kind"))
    ? searchParams.get("kind")
    : "abandoned";
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(initialKind);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load({
    nextQ = q,
    nextKind = kind,
    nextPage = page,
    nextLimit = limit,
    silent = false,
  } = {}) {
    if (!silent) setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(nextLimit),
      kind: nextKind,
      _t: String(Date.now()),
    });
    if (nextQ) params.set("q", nextQ);
    try {
      setData(await adminFetch(`/admin/carts?${params}`));
      setError("");
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, kind]);

  useEffect(() => {
    const POLL_MS = 8000;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      load({ silent: true });
    }, POLL_MS);
    const onFocus = () => load({ silent: true });
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, kind, q]);

  function search(event) {
    event.preventDefault();
    setPage(1);
    load({ nextPage: 1 });
  }

  const summary = data?.summary || { open: 0, abandoned: 0, all: 0 };

  return (
    <div>
      <PageHeader
        title="Carts"
        description="Each number is shoppers (people), not products. Open a row to see which items they added."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Left without buying</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.abandoned}</p>
          <p className="text-xs text-slate-500">Shoppers idle 2h+ with items still in cart</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Shopping now</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.open}</p>
          <p className="text-xs text-slate-500">Shoppers active in the last 2 hours</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total shoppers</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.all}</p>
          <p className="text-xs text-slate-500">People with items in cart (not product count)</p>
        </Card>
      </div>

      <Card className="mb-4 p-3">
        <form className="flex flex-wrap gap-2" onSubmit={search}>
          <AdminInput
            className="min-w-[220px] flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, email, product…"
          />
          <AdminSelect
            className="w-44"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
          >
            <option value="abandoned">Left without buying (2h+)</option>
            <option value="open">Shopping now</option>
            <option value="all">All shoppers with cart</option>
          </AdminSelect>
          <AdminButton type="submit" variant="secondary">
            Search
          </AdminButton>
        </form>
      </Card>

      {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
      {loading && !data ? <p className="text-sm text-slate-500">Loading carts…</p> : null}

      <div className="grid gap-3">
        {(data?.items || []).length ? (
          data.items.map((cart) => {
            const contactBits = [cart.contact?.name, cart.contact?.phone, cart.contact?.email].filter(Boolean);
            const wa = whatsappHref(cart.contact?.phone, cart);
            return (
              <Card key={cart.id} className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {cart.contact?.name || (cart.registered ? "Registered shopper" : "Guest shopper")}
                      </p>
                      <Badge tone={cart.kind === "abandoned" ? "rose" : "amber"}>
                        {cart.kind === "abandoned" ? "Left without buying" : "Shopping now"}
                      </Badge>
                      {cart.registered ? <Badge tone="indigo">Account</Badge> : <Badge tone="slate">Guest</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {contactBits.length ? contactBits.join(" · ") : "No phone/email yet — browsing only"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Last active {formatWhen(cart.lastSeenAt)} · idle {cart.idleHours}h · {cart.itemCount} item
                      {cart.itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        WhatsApp offer
                      </a>
                    ) : null}
                    {cart.userId ? (
                      <Link
                        href={`/admin/users/${cart.userId}`}
                        className="inline-flex h-9 items-center rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        View user
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {(cart.items || []).map((item) => (
                    <div key={`${cart.id}-${item.productId}`} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt="" className="h-full w-full object-contain p-1" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{item.title || "Product"}</p>
                        <p className="text-xs text-slate-500">
                          Qty {item.qty}
                          {item.slug ? ` · ${item.slug}` : ""}
                        </p>
                      </div>
                      {item.href ? (
                        <Link
                          href={item.href}
                          target="_blank"
                          className="shrink-0 text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })
        ) : !loading ? (
          <Card className="px-4 py-10 text-center text-sm text-slate-500">
            No carts in this filter yet. Open carts appear when shoppers add items.
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

export default function AdminCartsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading carts…</p>}>
      <AdminCartsPageInner />
    </Suspense>
  );
}
