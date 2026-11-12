import { env } from "../../config/env.js";

/** Ask the Next.js app to refresh cached catalog pages after a product change. */
export function pingRevalidate(tags) {
  if (!env.revalidateUrl || !env.revalidateSecret) return;
  fetch(env.revalidateUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-revalidate-secret": env.revalidateSecret,
    },
    body: JSON.stringify({ tags }),
  }).catch((error) => {
    console.error("Revalidate ping failed", error.message);
  });
}
