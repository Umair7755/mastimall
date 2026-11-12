"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, TextArea } from "@/components/ui/Input";
import { StarPicker, StarRating } from "@/components/product/StarRating";
import { apiFetch } from "@/lib/browser";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return "";
  }
}

export function ReviewsPanel({ product, initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [ratingAvg, setRatingAvg] = useState(product.ratingAvg || 0);
  const [ratingCount, setRatingCount] = useState(product.ratingCount || 0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    for (const review of reviews) {
      const star = Math.min(5, Math.max(1, Number(review.rating) || 0));
      buckets[star - 1] += 1;
    }
    return buckets.reverse();
  }, [reviews]);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setOk("");
    if (!name.trim() || text.trim().length < 8) {
      setError("Please add your name and a short review.");
      return;
    }
    setBusy(true);
    try {
      const data = await apiFetch(`/products/${product.slug}/reviews`, {
        method: "POST",
        body: JSON.stringify({ name, city, title, text, rating }),
      });
      setReviews((prev) => [data.review, ...prev]);
      if (data.rating) {
        setRatingAvg(data.rating.ratingAvg);
        setRatingCount(data.rating.ratingCount);
      }
      setOk("Thank you! Your review is live.");
      setTitle("");
      setText("");
      setRating(5);
    } catch (err) {
      setError(err.message || "Could not save your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h2 className="font-display text-2xl lg:text-[32px]">Ratings & reviews</h2>
        <div className="mt-4 rounded-2xl border border-line/70 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-end gap-3">
            <p className="font-display text-5xl font-semibold text-ink">{ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}</p>
            <div>
              <StarRating value={ratingAvg} count={ratingCount} size={20} />
              <p className="mt-1 text-sm text-ink-muted">
                {ratingCount === 1 ? "1 review" : `${ratingCount} reviews`}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {summary.map((count, index) => {
              const stars = 5 - index;
              const width = ratingCount ? Math.round((count / ratingCount) * 100) : 0;
              return (
                <div key={stars} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-2 text-sm">
                  <span className="text-ink-muted">{stars}★</span>
                  <span className="h-2 overflow-hidden rounded-full bg-brand-soft">
                    <span className="block h-full rounded-full bg-sun" style={{ width: `${width}%` }} />
                  </span>
                  <span className="text-right text-ink-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 grid gap-3 rounded-2xl border border-line/70 bg-white p-5 shadow-soft">
          <p className="font-display text-xl">Write a review</p>
          <div>
            <p className="mb-2 text-sm text-ink-muted">Your stars</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ayesha" required />
            </Field>
            <Field label="City">
              <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Lahore" />
            </Field>
          </div>
          <Field label="Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Kids loved it" />
          </Field>
          <Field label="Review" error={error}>
            <TextArea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Tell other parents what you liked…"
              required
            />
          </Field>
          {ok ? <p className="text-sm text-success">{ok}</p> : null}
          <Button type="submit" variant="sun" disabled={busy}>
            {busy ? "Sending…" : "Post review"}
          </Button>
        </form>
      </div>

      <div className="grid gap-3 content-start">
        {reviews.length ? (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StarRating value={review.rating} showCount={false} size={15} />
                <span className="text-xs text-ink-muted">{formatDate(review.createdAt)}</span>
              </div>
              {review.title ? <h3 className="mt-2 font-display text-lg">{review.title}</h3> : null}
              <p className="mt-2 text-ink-muted">{review.text}</p>
              <p className="mt-3 text-sm font-medium text-ink">
                {review.name}
                {review.city ? ` · ${review.city}` : ""}
              </p>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-line bg-white p-6 text-ink-muted">
            No reviews yet. Be the first to share how your little one liked this toy.
          </p>
        )}
      </div>
    </section>
  );
}
