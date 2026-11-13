import { apiFetch } from "@/lib/browser";
import { refreshStoreCache } from "@/lib/refresh-store";

export function adminFetch(path, options = {}) {
  return apiFetch(path, options);
}

/** Prefer this after catalog/banner saves so the live shop updates immediately. */
export async function adminMutate(path, options = {}, tags = ["products", "home", "departments"]) {
  const data = await apiFetch(path, options);
  await refreshStoreCache(tags).catch(() => null);
  return data;
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
