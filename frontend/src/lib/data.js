import { cacheLife, cacheTag } from "next/cache";
import { apiGet } from "@/lib/api.js";
import { FALLBACK_HOME } from "@/lib/constants";

export async function getHome() {
  "use cache";
  cacheLife("minutes");
  cacheTag("home");
  const data = await apiGet("/settings/home");
  if (!data?.sections) throw new Error("Home settings are missing.");
  return data;
}

export async function getSaleBanner() {
  "use cache";
  cacheLife("minutes");
  cacheTag("home");
  try {
    const data = await apiGet("/settings/banner");
    return data?.banner || null;
  } catch {
    return null;
  }
}

export async function getDepartments() {
  "use cache";
  cacheLife("minutes");
  cacheTag("departments");
  const data = await apiGet("/departments?withCategories=1");
  return data?.departments || [];
}

export async function getDepartment(slug) {
  "use cache";
  cacheLife("minutes");
  cacheTag("departments");
  return apiGet(`/departments/${slug}`);
}

export async function getCategory(department, slug) {
  "use cache";
  cacheLife("minutes");
  cacheTag("departments");
  return apiGet(`/categories/${department}/${slug}`);
}

export async function getProducts(queryString) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  return apiGet(`/products?${queryString}`);
}

export async function getProduct(slug) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  cacheTag(`product:${slug}`);
  return apiGet(`/products/${slug}`);
}

export async function getProductSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const data = await apiGet("/products/slugs");
  return data?.slugs || [];
}

export async function loadShell() {
  try {
    const [home, departments] = await Promise.all([getHome(), getDepartments()]);
    return { home, departments };
  } catch {
    return { home: FALLBACK_HOME, departments: [] };
  }
}

/** Order lookup is private and always read live. */
export async function getOrder(orderNumber, phone) {
  const data = await apiGet(`/orders/${encodeURIComponent(orderNumber)}?phone=${encodeURIComponent(phone)}`);
  return data?.order || null;
}
