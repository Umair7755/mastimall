/** Server-side fetch against the Express API. The browser uses /api via a rewrite. */
export async function apiGet(path) {
  const base = process.env.API_URL || "http://127.0.0.1:4000/api";
  const response = await fetch(`${base}${path}`, {
    headers: { accept: "application/json" },
    // Rely on `"use cache"` + tags in data.js — don't keep a second Next fetch cache.
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `The store API returned ${response.status}.`);
  }
  return response.json();
}
