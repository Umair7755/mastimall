import { env } from "../../config/env.js";
import { bumpCatalogRevision } from "./catalogRevision.js";

/** Ask the Next.js app to refresh cached catalog pages after a product change. */
export function pingRevalidate(tags) {
  bumpCatalogRevision().catch((error) => {
    console.error("Catalog revision bump failed", error.message);
  });

  if (!env.revalidateUrl || !env.revalidateSecret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("Revalidate skipped: set REVALIDATE_URL and REVALIDATE_SECRET on the API host.");
    }
    return;
  }
  const url = env.revalidateUrl.replace(/\/$/, "");
  fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-revalidate-secret": env.revalidateSecret,
    },
    body: JSON.stringify({ tags }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error(`Revalidate ping failed ${response.status}`, text.slice(0, 200));
      }
    })
    .catch((error) => {
      console.error("Revalidate ping failed", error.message);
    });
}
