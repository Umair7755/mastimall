import { siteUrl } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/account", "/wishlist", "/api"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
