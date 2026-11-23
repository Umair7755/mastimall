"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Package, Sparkles, Truck } from "lucide-react";
import {
  AdminButton,
  AdminField,
  AdminInput,
  Card,
  PageHeader,
  StatCard,
} from "@/components/admin/ui";
import { adminFetch, adminMutate } from "@/lib/admin";
import { cn } from "@/lib/cn";

const EMPTY = {
  freeAt: 3000,
  nearFee: 200,
  farFee: 250,
  nearCities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi"],
};

function formatRs(n) {
  const value = Math.max(0, Math.round(Number(n) || 0));
  return `Rs ${value.toLocaleString("en-PK")}`;
}

function parseCities(text) {
  return [
    ...new Set(
      String(text || "")
        .split(/[\n,]+/)
        .map((city) => city.trim().replace(/\s+/g, " "))
        .filter(Boolean)
    ),
  ];
}

export default function AdminShippingPage() {
  const [form, setForm] = useState(EMPTY);
  const [citiesText, setCitiesText] = useState(EMPTY.nearCities.join(", "));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/admin/settings/shipping")
      .then(({ shipping }) => {
        const next = {
          freeAt: Number(shipping?.freeAt ?? EMPTY.freeAt),
          nearFee: Number(shipping?.nearFee ?? EMPTY.nearFee),
          farFee: Number(shipping?.farFee ?? EMPTY.farFee),
          nearCities: Array.isArray(shipping?.nearCities) && shipping.nearCities.length
            ? shipping.nearCities
            : EMPTY.nearCities,
        };
        setForm(next);
        setCitiesText(next.nearCities.join(", "));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  const preview = useMemo(() => {
    const cities = parseCities(citiesText);
    return {
      freeAt: Math.max(0, Math.round(Number(form.freeAt) || 0)),
      nearFee: Math.max(0, Math.round(Number(form.nearFee) || 0)),
      farFee: Math.max(0, Math.round(Number(form.farFee) || 0)),
      nearCities: cities.length ? cities : EMPTY.nearCities,
    };
  }, [form.freeAt, form.nearFee, form.farFee, citiesText]);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const payload = {
        freeAt: preview.freeAt,
        nearFee: preview.nearFee,
        farFee: preview.farFee,
        nearCities: preview.nearCities,
      };
      const { shipping } = await adminMutate(
        "/admin/settings/shipping",
        { method: "PUT", body: JSON.stringify(payload) },
        ["home", "products"]
      );
      setForm({
        freeAt: shipping.freeAt,
        nearFee: shipping.nearFee,
        farFee: shipping.farFee,
        nearCities: shipping.nearCities,
      });
      setCitiesText(shipping.nearCities.join(", "));
      setSaved(true);
      setPending(false);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Shipping" description="Loading delivery settings…" />
        <Card className="p-8 text-sm text-slate-500">Fetching current fees…</Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Shipping"
        description="Set one delivery fee for the whole order. Checkout, cart, and product pages read these live values."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Near cities"
          value={formatRs(preview.nearFee)}
          hint={preview.nearCities.slice(0, 2).join(", ") + (preview.nearCities.length > 2 ? "…" : "")}
          tone="emerald"
        />
        <StatCard
          label="Other cities"
          value={formatRs(preview.farFee)}
          hint="Everywhere else in Pakistan"
          tone="sky"
        />
        <StatCard
          label="Free from"
          value={formatRs(preview.freeAt)}
          hint="Based on product subtotal"
          tone="amber"
        />
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-amber-300">
                <Truck size={16} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Delivery fees</p>
                <p className="text-xs text-slate-500">Same fee for the cart — not per product.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-3">
            <AdminField label="Near-city fee (Rs)">
              <AdminInput
                type="number"
                min="0"
                step="1"
                value={form.nearFee}
                onChange={(e) => setField("nearFee", e.target.value)}
                required
              />
            </AdminField>
            <AdminField label="Other-city fee (Rs)">
              <AdminInput
                type="number"
                min="0"
                step="1"
                value={form.farFee}
                onChange={(e) => setField("farFee", e.target.value)}
                required
              />
            </AdminField>
            <AdminField label="Free shipping from (Rs)">
              <AdminInput
                type="number"
                min="0"
                step="1"
                value={form.freeAt}
                onChange={(e) => setField("freeAt", e.target.value)}
                required
              />
            </AdminField>

            <AdminField label="Near cities" className="sm:col-span-3">
              <textarea
                value={citiesText}
                onChange={(e) => {
                  setCitiesText(e.target.value);
                  setSaved(false);
                }}
                rows={3}
                placeholder="Karachi, Lahore, Islamabad, Rawalpindi"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Separate with commas. These cities get the near fee; all others get the far fee.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preview.nearCities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200/80"
                  >
                    <MapPin size={11} aria-hidden="true" />
                    {city}
                  </span>
                ))}
              </div>
            </AdminField>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-3">
            <AdminButton type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save shipping"}
            </AdminButton>
            {saved ? <p className="text-sm font-medium text-emerald-600">Saved — live on storefront.</p> : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </Card>

        <div className="grid gap-4 self-start">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Customer preview</p>
              <p className="text-xs text-slate-500">How fees appear at checkout</p>
            </div>
            <div className="grid gap-3 p-4">
              <PreviewRow
                icon={Package}
                title="Order under free threshold"
                detail={`Cart below ${formatRs(preview.freeAt)}`}
                fee={formatRs(preview.nearFee)}
                note={`Near city · e.g. ${preview.nearCities[0] || "Karachi"}`}
                tone="emerald"
              />
              <PreviewRow
                icon={Truck}
                title="Other city delivery"
                detail={`Cart below ${formatRs(preview.freeAt)}`}
                fee={formatRs(preview.farFee)}
                note="Faisalabad, Multan, Other…"
                tone="sky"
              />
              <PreviewRow
                icon={Sparkles}
                title="Free delivery unlocks"
                detail={`Cart ${formatRs(preview.freeAt)} or more`}
                fee="Free"
                note="Product subtotal before shipping"
                tone="amber"
              />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Rule of thumb</p>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              One fee for the whole order. Near cities pay{" "}
              <span className="font-semibold text-amber-300">{formatRs(preview.nearFee)}</span>, others{" "}
              <span className="font-semibold text-amber-300">{formatRs(preview.farFee)}</span>, and delivery
              is free from <span className="font-semibold text-amber-300">{formatRs(preview.freeAt)}</span>.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}

function PreviewRow({ icon: Icon, title, detail, fee, note, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1", tones[tone])}>
          <Icon size={15} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{detail}</p>
            </div>
            <span className="shrink-0 font-display text-sm font-bold tabular-nums text-slate-900">{fee}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{note}</p>
        </div>
      </div>
    </div>
  );
}
