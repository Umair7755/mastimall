"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, History, LogOut, Package, Save, UserRound } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { OrderStatusTrack } from "@/components/order/OrderStatusTrack";
import { apiFetch } from "@/lib/browser";
import { formatPkr } from "@/lib/format";
import { isPkMobile, normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/cn";

const ORDER_PAGE_SIZE = 4;

function firstName(name) {
  const part = String(name || "").trim().split(/\s+/)[0];
  return part || "friend";
}

export function AccountPanel() {
  const [mode, setMode] = useState("login");
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [openOrder, setOpenOrder] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [profile, setProfile] = useState({ name: "", phone: "" });

  const orderPages = Math.max(1, Math.ceil(orders.length / ORDER_PAGE_SIZE));
  const safeOrderPage = Math.min(orderPage, orderPages);
  const pageOrders = useMemo(() => {
    const start = (safeOrderPage - 1) * ORDER_PAGE_SIZE;
    return orders.slice(start, start + ORDER_PAGE_SIZE);
  }, [orders, safeOrderPage]);

  async function loadAccount() {
    const me = await apiFetch("/auth/me");
    setCustomer(me.customer);
    setProfile({ name: me.customer.name || "", phone: me.customer.phone || "" });
    try {
      const data = await apiFetch("/account/orders");
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    }
  }

  useEffect(() => {
    apiFetch("/auth/me")
      .then((data) => {
        setCustomer(data.customer);
        setProfile({ name: data.customer.name || "", phone: data.customer.phone || "" });
        return apiFetch("/account/orders");
      })
      .then((data) => {
        setOrders(data.orders || []);
        setOrderPage(1);
      })
      .catch(() => {
        setCustomer(null);
        setOrders([]);
        setOrderPage(1);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    setOrderPage((current) => Math.min(current, Math.max(1, Math.ceil(orders.length / ORDER_PAGE_SIZE) || 1)));
  }, [orders.length]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (mode === "register" && !isPkMobile(form.phone)) {
      setError("Phone number should look like 03XX-XXXXXXX.");
      return;
    }
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, phone: normalizePhone(form.phone), password: form.password };
      await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
      await loadAccount();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileMsg("");
    setError("");
    if (!isPkMobile(profile.phone)) {
      setError("Phone number should look like 03XX-XXXXXXX.");
      return;
    }
    setSaving(true);
    try {
      const data = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: profile.name, phone: normalizePhone(profile.phone) }),
      });
      setCustomer(data.customer);
      setProfile({ name: data.customer.name || "", phone: data.customer.phone || "" });
      setProfileMsg("Profile saved.");
      const history = await apiFetch("/account/orders");
      setOrders(history.orders || []);
      setOrderPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    setCustomer(null);
    setOrders([]);
    setProfileMsg("");
  }

  if (!ready) return <div className="skeleton mx-auto mt-8 h-40 max-w-5xl rounded-card px-4" />;

  if (!customer) {
    return (
      <div className="mx-auto max-w-md px-4 py-6 sm:py-8">
        <h1 className="font-display text-[28px] font-semibold sm:text-[32px]">Account</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Log in to see order history, update your details, and keep your wishlist.
        </p>
        <form onSubmit={onSubmit} className="mt-5 grid gap-3 rounded-2xl border border-line/70 bg-white p-4 shadow-soft sm:p-5">
          <div className="flex gap-2">
            <Button type="button" variant={mode === "login" ? "primary" : "secondary"} onClick={() => setMode("login")}>
              Log in
            </Button>
            <Button
              type="button"
              variant={mode === "register" ? "primary" : "secondary"}
              onClick={() => setMode("register")}
            >
              Create account
            </Button>
          </div>
          {mode === "register" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <Input name="name" value={form.name} onChange={update} autoComplete="name" required />
              </Field>
              <Field label="Phone" hint="03XX-XXXXXXX">
                <Input name="phone" value={form.phone} onChange={update} inputMode="tel" required />
              </Field>
            </div>
          ) : null}
          <div className={cn("grid gap-3", mode === "register" ? "sm:grid-cols-2" : "")}>
            <Field label="Email">
              <Input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
            </Field>
            <Field label="Password" hint={mode === "register" ? "At least 8 characters." : ""}>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={update}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "register" ? 8 : 1}
                required
              />
            </Field>
          </div>
          {error ? <p className="text-danger">{error}</p> : null}
          <Button type="submit">{mode === "login" ? "Log in" : "Create account"}</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:py-6">
      <div className="overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-r from-[#312e81] via-[#4f46e5] to-[#7c3aed] px-4 py-3.5 text-white shadow-soft sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sun">Your account</p>
            <h1 className="truncate font-display text-xl font-semibold leading-tight sm:text-2xl">
              Welcome {firstName(customer.name)}
            </h1>
            <p className="truncate text-xs text-white/80">{customer.email}</p>
          </div>
          <Button
            className="h-9 shrink-0 border-white/20 bg-white/15 px-3 text-sm text-white hover:bg-white hover:text-brand"
            variant="secondary"
            onClick={logout}
          >
            <LogOut size={14} aria-hidden="true" />
            Log out
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-start">
        <section className="rounded-2xl border border-line/70 bg-white p-3.5 shadow-soft sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
              <UserRound size={14} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold">Profile</h2>
              <p className="text-xs text-ink-muted">Name and phone for deliveries.</p>
            </div>
          </div>
          <form onSubmit={saveProfile} className="grid gap-2.5">
            <Field label="Name">
              <Input
                className="h-12"
                value={profile.name}
                onChange={(e) => setProfile((current) => ({ ...current, name: e.target.value }))}
                required
              />
            </Field>
            <Field label="Phone" hint="03XX-XXXXXXX">
              <Input
                className="h-12"
                value={profile.phone}
                onChange={(e) => setProfile((current) => ({ ...current, phone: e.target.value }))}
                inputMode="tel"
                required
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={saving} className="h-10 px-3 text-sm">
                <Save size={14} aria-hidden="true" />
                {saving ? "Saving…" : "Save profile"}
              </Button>
              {profileMsg ? <p className="text-xs font-semibold text-emerald-600">{profileMsg}</p> : null}
              {error ? <p className="text-xs text-danger">{error}</p> : null}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-line/70 bg-white p-3.5 shadow-soft sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sun/90 text-ink">
                <History size={14} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-semibold">Order history</h2>
                <p className="text-xs text-ink-muted">
                  {orders.length ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : "No orders yet"}
                </p>
              </div>
            </div>
            <ButtonLink href="/track" variant="secondary" className="h-9 shrink-0 px-2.5 text-xs">
              Track
            </ButtonLink>
          </div>

          {!orders.length ? (
            <div className="rounded-xl border border-dashed border-line bg-[#faf8f4] px-3 py-5 text-center">
              <Package className="mx-auto text-brand" size={22} aria-hidden="true" />
              <p className="mt-2 font-display text-base font-semibold">No orders yet</p>
              <p className="mt-1 text-xs text-ink-muted">Logged-in orders show up here.</p>
              <ButtonLink href="/" className="mt-3 h-10 px-3 text-sm">
                Start shopping
              </ButtonLink>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                {pageOrders.map((order) => {
                  const open = openOrder === order.orderNumber;
                  return (
                    <article key={order.orderNumber} className="overflow-hidden rounded-xl border border-line/70 bg-[#faf8f4]">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-white/70"
                        onClick={() => setOpenOrder(open ? "" : order.orderNumber)}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold text-ink">{order.orderNumber}</p>
                          <p className="text-[11px] text-ink-muted">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}{" "}
                            · {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold tabular-nums text-ink">{formatPkr(order.total)}</p>
                          <span
                            className={cn(
                              "mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                              order.status === "delivered"
                                ? "bg-emerald-100 text-emerald-700"
                                : order.status === "cancelled" || order.status === "returned"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-brand-soft text-brand"
                            )}
                          >
                            {order.status}
                          </span>
                        </div>
                      </button>
                      {open ? (
                        <div className="border-t border-line/60 bg-white px-3 py-3">
                          <OrderStatusTrack status={order.status} compact />
                          <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
                            {order.items?.map((item) => (
                              <li
                                key={`${order.orderNumber}-${item.slug}-${item.title}`}
                                className="flex justify-between gap-2"
                              >
                                <span className="min-w-0 truncate">
                                  {item.title} × {item.qty}
                                </span>
                                <span className="shrink-0 tabular-nums">{formatPkr(item.unitPrice * item.qty)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3">
                            <Link
                              href={
                                customer.phone
                                  ? `/order/${encodeURIComponent(order.orderNumber)}?phone=${encodeURIComponent(customer.phone)}`
                                  : `/order/${encodeURIComponent(order.orderNumber)}`
                              }
                              className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-brand px-3 text-xs font-semibold text-white"
                            >
                              Open order
                            </Link>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              {orderPages > 1 ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3">
                  <p className="text-xs text-ink-muted">
                    Page {safeOrderPage} of {orderPages}
                    <span className="mx-1 text-line">·</span>
                    {(safeOrderPage - 1) * ORDER_PAGE_SIZE + 1}–
                    {Math.min(safeOrderPage * ORDER_PAGE_SIZE, orders.length)} of {orders.length}
                  </p>
                  <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-[#faf8f4] p-1">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safeOrderPage <= 1}
                      aria-label="Previous orders page"
                      onClick={() => {
                        setOpenOrder("");
                        setOrderPage((page) => Math.max(1, page - 1));
                      }}
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    {(() => {
                      const windowSize = 5;
                      let start = Math.max(1, safeOrderPage - Math.floor(windowSize / 2));
                      let end = Math.min(orderPages, start + windowSize - 1);
                      start = Math.max(1, end - windowSize + 1);
                      const pages = [];
                      for (let page = start; page <= end; page += 1) pages.push(page);
                      return pages.map((page) => (
                        <button
                          key={page}
                          type="button"
                          aria-label={`Orders page ${page}`}
                          aria-current={page === safeOrderPage ? "page" : undefined}
                          className={cn(
                            "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition",
                            page === safeOrderPage ? "bg-brand text-white" : "text-ink hover:bg-white"
                          )}
                          onClick={() => {
                            setOpenOrder("");
                            setOrderPage(page);
                          }}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safeOrderPage >= orderPages}
                      aria-label="Next orders page"
                      onClick={() => {
                        setOpenOrder("");
                        setOrderPage((page) => Math.min(orderPages, page + 1));
                      }}
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
