import { apiFetch } from "@/lib/browser";

export function adminFetch(path, options = {}) {
  return apiFetch(path, options);
}

export function formatMoney(value) {
  const amount = Number(value) || 0;
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140);
}
