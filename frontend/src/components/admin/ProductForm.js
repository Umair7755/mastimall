"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, adminMutate, slugify } from "@/lib/admin";
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  Card,
} from "@/components/admin/ui";

const EMPTY = {
  title: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "10",
  brand: "",
  departmentId: "",
  categoryId: "",
  audience: [],
  ageBands: [],
  status: "active",
  isNew: true,
  isFeatured: false,
  fragile: false,
  imageUrl: "",
};

export function ProductForm({ productId = null }) {
  const router = useRouter();
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));

  useEffect(() => {
    adminFetch("/admin/catalog-options").then(setOptions).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!productId) return;
    adminFetch(`/admin/products/${productId}`)
      .then(({ product }) => {
        setForm({
          title: product.title || "",
          slug: product.slug || "",
          sku: product.sku || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          salePrice: product.salePrice != null ? String(product.salePrice) : "",
          stock: String(product.stock ?? 0),
          brand: product.brand || "",
          departmentId: product.departmentId || "",
          categoryId: product.categoryId || "",
          audience: product.audience || [],
          ageBands: product.ageBands || [],
          status: product.status || "active",
          isNew: !!product.isNew,
          isFeatured: !!product.isFeatured,
          fragile: !!product.fragile,
          imageUrl: product.images?.[0]?.url || "",
        });
        setSlugTouched(true);
      })
      .catch((err) => setError(err.message));
  }, [productId]);

  const categories = useMemo(() => {
    if (!options) return [];
    if (!form.departmentId) return options.categories || [];
    return (options.categories || []).filter((item) => item.departmentId === form.departmentId);
  }, [options, form.departmentId]);

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  function toggleList(key, value) {
    setForm((prev) => {
      const list = new Set(prev[key] || []);
      if (list.has(value)) list.delete(value);
      else list.add(value);
      return { ...prev, [key]: [...list] };
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      sku: form.sku.trim() || undefined,
      description: form.description.trim(),
      price: Number(form.price),
      salePrice: form.salePrice === "" ? null : Number(form.salePrice),
      stock: Number(form.stock) || 0,
      brand: form.brand.trim(),
      departmentId: form.departmentId,
      categoryId: form.categoryId,
      audience: form.audience,
      ageBands: form.ageBands,
      status: form.status,
      isNew: form.isNew,
      isFeatured: form.isFeatured,
      fragile: form.fragile,
      images: form.imageUrl
        ? [{ url: form.imageUrl, alt: form.title }]
        : [{ url: `/art/${form.slug || "product"}.svg`, alt: form.title }],
    };

    try {
      if (productId) {
        await adminMutate(
          `/admin/products/${productId}`,
          { method: "PATCH", body: JSON.stringify(payload) },
          ["products", "home", "departments", `product:${payload.slug}`]
        );
      } else {
        await adminMutate(
          "/admin/products",
          { method: "POST", body: JSON.stringify(payload) },
          ["products", "home", "departments", `product:${payload.slug}`]
        );
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  if (!options && !error) return <p className="text-sm text-slate-500">Loading form…</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Card className="grid gap-4 p-4 md:grid-cols-2">
        <AdminField label="Title">
          <AdminInput value={form.title} onChange={(e) => setField("title", e.target.value)} required />
        </AdminField>
        <AdminField label="Slug">
          <AdminInput
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setField("slug", e.target.value);
            }}
            required
          />
        </AdminField>
        <AdminField label="Price (Rs)">
          <AdminInput type="number" min="1" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
        </AdminField>
        <AdminField label="Sale price">
          <AdminInput type="number" min="0" value={form.salePrice} onChange={(e) => setField("salePrice", e.target.value)} />
        </AdminField>
        <AdminField label="Stock">
          <AdminInput type="number" min="0" value={form.stock} onChange={(e) => setField("stock", e.target.value)} />
        </AdminField>
        <AdminField label="Brand">
          <AdminInput value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
        </AdminField>
        <AdminField label="Department">
          <AdminSelect value={form.departmentId} onChange={(e) => setField("departmentId", e.target.value)} required>
            <option value="">Select…</option>
            {(options?.departments || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Category">
          <AdminSelect value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)} required>
            <option value="">Select…</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Status">
          <AdminSelect value={form.status} onChange={(e) => setField("status", e.target.value)}>
            <option value="active">Visible on store</option>
            <option value="draft">Hidden from store</option>
            <option value="archived">Archived</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="SKU">
          <AdminInput value={form.sku} onChange={(e) => setField("sku", e.target.value)} />
        </AdminField>
        <AdminField label="Image URL" className="md:col-span-2">
          <AdminInput
            value={form.imageUrl}
            onChange={(e) => setField("imageUrl", e.target.value)}
            placeholder="/art/my-toy.svg"
          />
        </AdminField>
        <AdminField label="Description" className="md:col-span-2">
          <AdminTextarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={4} />
        </AdminField>
      </Card>

      <Card className="grid gap-4 p-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Audience</p>
          <div className="flex flex-wrap gap-2">
            {(options?.audiences || []).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleList("audience", item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  form.audience.includes(item) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Age bands</p>
          <div className="flex flex-wrap gap-2">
            {(options?.ageBands || []).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleList("ageBands", item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  form.ageBands.includes(item) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-700">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.isNew} onChange={(e) => setField("isNew", e.target.checked)} />
            New
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)} />
            Featured
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.fragile} onChange={(e) => setField("fragile", e.target.checked)} />
            Fragile
          </label>
        </div>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex gap-2">
        <AdminButton type="submit" disabled={pending}>
          {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
        </AdminButton>
        <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
