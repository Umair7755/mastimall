import { getDepartments, getProductSlugs } from "@/lib/data";
import { AGE_BANDS, AUDIENCES, BUDGETS } from "@/lib/constants";
import { siteUrl } from "@/lib/seo";

export default async function sitemap() {
  const site = siteUrl();
  const [departments, slugs] = await Promise.all([
    getDepartments().catch(() => []),
    getProductSlugs().catch(() => []),
  ]);
  const urls = [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/search`, changeFrequency: "daily", priority: 0.4 },
  ];
  for (const item of AUDIENCES) urls.push({ url: `${site}/for/${item.slug}`, changeFrequency: "daily", priority: 0.7 });
  for (const item of AGE_BANDS) urls.push({ url: `${site}/age/${item.slug}`, changeFrequency: "daily", priority: 0.7 });
  for (const item of BUDGETS) urls.push({ url: `${site}/budget/${item.slug}`, changeFrequency: "daily", priority: 0.7 });
  for (const department of departments) {
    urls.push({ url: `${site}/${department.slug}`, changeFrequency: "daily", priority: 0.8 });
    for (const category of department.categories || []) {
      urls.push({ url: `${site}/${department.slug}/${category.slug}`, changeFrequency: "daily", priority: 0.7 });
    }
  }
  for (const item of slugs) {
    urls.push({ url: `${site}/${item.department}/${item.category}/${item.slug}`, changeFrequency: "weekly", priority: 0.6 });
  }
  return urls;
}
