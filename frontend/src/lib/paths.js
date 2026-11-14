/** First string when a query value arrives as a string or a list. */
export function one(value) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

/** Catalog path for a product. Department and category come from the API. */
export function productPath(product) {
  const department = product?.department?.slug || "shop";
  const category = product?.category?.slug || "item";
  return `/${department}/${category}/${product.slug}`;
}

/**
 * Copy the current query, apply a patch, and drop the page unless the patch sets it.
 * @param {string} pathname
 * @param {Record<string, string | string[] | undefined>} searchParams
 * @param {Record<string, string | number | null | false | undefined>} patch
 */
export function hrefWith(pathname, searchParams, patch, { resetPage = true } = {}) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    const picked = one(value);
    if (picked) next.set(key, picked);
  }
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === "" || value === false) next.delete(key);
    else next.set(key, String(value));
  }
  if (resetPage && !Object.prototype.hasOwnProperty.call(patch, "page")) next.delete("page");
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Stable query string so cached product lists share one key. */
export function productQuery(input) {
  const params = new URLSearchParams();
  const query = input.searchParams || {};
  const set = (key, value) => {
    if (value != null && value !== "" && value !== false) params.set(key, String(value));
  };

  set("department", one(query.department) || input.department);
  set("category", one(query.category) || input.category);
  set("audience", one(query.audience) || input.audience);
  set("age", one(query.age) || input.age);
  set("minPrice", one(query.minPrice) || input.minPrice);
  set("maxPrice", one(query.maxPrice) || input.maxPrice);
  set("brand", one(query.brand));
  set("tag", one(query.tag) || input.tag);
  set("inStock", one(query.inStock));
  set("onSale", one(query.onSale));
  set("isNew", one(query.isNew));
  set("featured", one(query.featured));
  set("q", one(query.q));
  set("sort", one(query.sort) || input.sort || "popular");
  set("page", one(query.page) || "1");
  set("limit", input.limit || "24");
  if (input.excludeAdult) set("excludeAdult", "1");
  return params.toString();
}
