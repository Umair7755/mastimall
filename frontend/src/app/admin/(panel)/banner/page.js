"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminTextarea,
  Card,
  PageHeader,
} from "@/components/admin/ui";
import { adminFetch, adminMutate } from "@/lib/admin";

const EMPTY = {
  enabled: true,
  badge: "11.11 SALE",
  title: "Mega toy & décor deals",
  subtitle: "Up to 40% off · Free delivery from Rs 3,000",
  ctaLabel: "Shop deals",
  ctaHref: "/search?onSale=1",
  endsAt: "",
  message: "",
};

export default function AdminBannerPage() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    adminFetch("/admin/settings/banner")
      .then(({ banner }) => {
        setForm({
          enabled: !!banner.enabled,
          badge: banner.badge || "",
          title: banner.title || "",
          subtitle: banner.subtitle || "",
          ctaLabel: banner.ctaLabel || "",
          ctaHref: banner.ctaHref || "",
          endsAt: banner.endsAt ? String(banner.endsAt).slice(0, 16) : "",
          message: banner.message || "",
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const endsAt = form.endsAt ? new Date(form.endsAt).toISOString() : null;
      await adminMutate(
        "/admin/settings/banner",
        {
          method: "PUT",
          body: JSON.stringify({
            enabled: form.enabled,
            badge: form.badge,
            title: form.title,
            subtitle: form.subtitle,
            ctaLabel: form.ctaLabel,
            ctaHref: form.ctaHref,
            endsAt,
            message: form.message,
          }),
        },
        ["home"]
      );
      setSaved(true);
      setPending(false);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sale banner"
        description="Controls the animated top bar on the storefront."
      />

      <form onSubmit={onSubmit} className="max-w-3xl">
        <Card className="grid gap-4 p-4 md:grid-cols-2">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setField("enabled", e.target.checked)}
            />
            Show banner on storefront
          </label>

          <AdminField label="Badge">
            <AdminInput value={form.badge} onChange={(e) => setField("badge", e.target.value)} required />
          </AdminField>
          <AdminField label="Countdown ends at">
            <AdminInput
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setField("endsAt", e.target.value)}
            />
          </AdminField>
          <AdminField label="Title" className="md:col-span-2">
            <AdminInput value={form.title} onChange={(e) => setField("title", e.target.value)} required />
          </AdminField>
          <AdminField label="Subtitle" className="md:col-span-2">
            <AdminInput value={form.subtitle} onChange={(e) => setField("subtitle", e.target.value)} />
          </AdminField>
          <AdminField label="Button label">
            <AdminInput value={form.ctaLabel} onChange={(e) => setField("ctaLabel", e.target.value)} required />
          </AdminField>
          <AdminField label="Button link">
            <AdminInput value={form.ctaHref} onChange={(e) => setField("ctaHref", e.target.value)} required />
          </AdminField>
          <AdminField label="Footer note" className="md:col-span-2">
            <AdminTextarea value={form.message} onChange={(e) => setField("message", e.target.value)} rows={2} />
          </AdminField>
        </Card>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        {saved ? <p className="mt-3 text-sm text-emerald-600">Banner saved.</p> : null}

        <div className="mt-4">
          <AdminButton type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save banner"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
