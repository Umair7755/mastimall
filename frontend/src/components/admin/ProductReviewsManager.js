"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { AdminButton, AdminField, AdminInput, AdminSelect, AdminTextarea, Badge, Card, CardHeader } from "@/components/admin/ui";
import { adminFetch, adminMutate } from "@/lib/admin";
import { cn } from "@/lib/cn";

const EMPTY = {
  name: "",
  city: "",
  title: "",
  text: "",
  rating: "5",
};

function Stars({ value }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          className={index < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

export function ProductReviewsManager({ productId }) {
  const [meta, setMeta] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await adminFetch(`/admin/products/${productId}/reviews`);
      setMeta(data.product);
      setReviews(data.reviews || []);
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
  }, [productId]);

  const visible = useMemo(() => {
    if (filter === "low") return reviews.filter((item) => Number(item.rating) <= 2);
    if (filter === "admin") return reviews.filter((item) => item.source === "admin");
    if (filter === "customer") return reviews.filter((item) => item.source !== "admin");
    return reviews;
  }, [reviews, filter]);

  function startEdit(review) {
    setEditingId(review.id);
    setForm({
      name: review.name || "",
      city: review.city || "",
      title: review.title || "",
      text: review.text || "",
      rating: String(review.rating || 5),
    });
  }

  function resetForm() {
    setEditingId("");
    setForm(EMPTY);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const body = {
      name: form.name.trim(),
      city: form.city.trim(),
      title: form.title.trim(),
      text: form.text.trim(),
      rating: Number(form.rating),
    };
    const tags = ["products", meta?.slug ? `product:${meta.slug}` : null].filter(Boolean);
    try {
      if (editingId) {
        const data = await adminMutate(
          `/admin/reviews/${editingId}`,
          { method: "PATCH", body: JSON.stringify(body) },
          tags
        );
        setReviews((current) => current.map((item) => (item.id === editingId ? data.review : item)));
        if (data.rating) {
          setMeta((current) =>
            current
              ? { ...current, ratingAvg: data.rating.ratingAvg, ratingCount: data.rating.ratingCount }
              : current
          );
        }
      } else {
        const data = await adminMutate(
          `/admin/products/${productId}/reviews`,
          { method: "POST", body: JSON.stringify(body) },
          tags
        );
        setReviews((current) => [data.review, ...current]);
        if (data.rating) {
          setMeta((current) =>
            current
              ? { ...current, ratingAvg: data.rating.ratingAvg, ratingCount: data.rating.ratingCount }
              : current
          );
        }
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function removeReview(review) {
    const ok = window.confirm(`Delete review by “${review.name}”? Product rating will update automatically.`);
    if (!ok) return;
    setPending(true);
    const tags = ["products", meta?.slug ? `product:${meta.slug}` : null].filter(Boolean);
    try {
      const data = await adminMutate(`/admin/reviews/${review.id}`, { method: "DELETE" }, tags);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      if (data.rating) {
        setMeta((current) =>
          current
            ? { ...current, ratingAvg: data.rating.ratingAvg, ratingCount: data.rating.ratingCount }
            : current
        );
      }
      if (editingId === review.id) resetForm();
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (!productId) return null;

  return (
    <Card className="mt-4">
      <CardHeader
        title="Ratings & reviews"
        description="Add seed reviews, edit or remove negative feedback. Live product rating updates instantly."
        action={
          meta ? (
            <div className="text-right">
              <p className="font-display text-2xl font-semibold text-slate-900">
                {meta.ratingCount > 0 ? Number(meta.ratingAvg).toFixed(1) : "—"}
              </p>
              <p className="text-xs text-slate-500">{meta.ratingCount || 0} review{(meta.ratingCount || 0) === 1 ? "" : "s"}</p>
            </div>
          ) : null
        }
      />

      <div className="grid gap-4 border-b border-slate-100 p-4 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">
              {editingId ? "Edit review" : "Add review / rating"}
            </p>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-white"
              >
                <X size={13} />
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Name">
              <AdminInput
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                required
                placeholder="Ayesha"
              />
            </AdminField>
            <AdminField label="City">
              <AdminInput
                value={form.city}
                onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                placeholder="Lahore"
              />
            </AdminField>
          </div>

          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <AdminField label="Rating">
              <AdminSelect
                value={form.rating}
                onChange={(e) => setForm((current) => ({ ...current, rating: e.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} star{star === 1 ? "" : "s"}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label="Title">
              <AdminInput
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                placeholder="Loved it"
              />
            </AdminField>
          </div>

          <AdminField label="Review text">
            <AdminTextarea
              rows={4}
              value={form.text}
              onChange={(e) => setForm((current) => ({ ...current, text: e.target.value }))}
              required
              placeholder="Write a helpful review shoppers will see on the product page…"
            />
          </AdminField>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <AdminButton type="submit" disabled={pending} className="w-fit">
            {editingId ? (
              <>
                <Pencil size={14} />
                {pending ? "Saving…" : "Save changes"}
              </>
            ) : (
              <>
                <Plus size={14} />
                {pending ? "Adding…" : "Add review"}
              </>
            )}
          </AdminButton>
        </form>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All" },
              { id: "low", label: "Low (1–2★)" },
              { id: "customer", label: "Customer" },
              { id: "admin", label: "Admin added" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition",
                  filter === item.id
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? <p className="text-sm text-slate-500">Loading reviews…</p> : null}

          <div className="grid max-h-[28rem] gap-2 overflow-auto pr-1">
            {visible.map((review) => (
              <article
                key={review.id}
                className={cn(
                  "rounded-xl border bg-white p-3 shadow-sm",
                  Number(review.rating) <= 2 ? "border-rose-200 bg-rose-50/40" : "border-slate-200"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <Stars value={review.rating} />
                      <Badge tone={review.source === "admin" ? "indigo" : "slate"}>
                        {review.source === "admin" ? "admin" : "customer"}
                      </Badge>
                      {Number(review.rating) <= 2 ? <Badge tone="rose">negative</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {review.city || "—"}
                      {review.createdAt
                        ? ` · ${new Date(review.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(review)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeReview(review)}
                      disabled={pending}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
                {review.title ? <p className="mt-2 text-sm font-semibold text-slate-800">{review.title}</p> : null}
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.text}</p>
              </article>
            ))}
            {!loading && !visible.length ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No reviews in this filter yet. Add one on the left.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
