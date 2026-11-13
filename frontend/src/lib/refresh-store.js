"use server";

import { revalidateTag } from "next/cache";

const DEFAULT_TAGS = ["products", "home", "departments"];

/** Bust Next.js storefront cache after admin catalog/settings changes. */
export async function refreshStoreCache(tags = DEFAULT_TAGS) {
  const list = Array.isArray(tags) && tags.length ? tags : DEFAULT_TAGS;
  for (const tag of list) revalidateTag(tag, "max");
  return { ok: true, tags: list };
}
