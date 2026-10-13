import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/cofolo";
import { POLICIES } from "@/lib/policies";
import { absoluteUrl, allProducts } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, products] = await Promise.all([getCatalog(), allProducts()]);
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/track"), changeFrequency: "monthly", priority: 0.4 },
    ...POLICIES.map((policy) => ({
      url: absoluteUrl(`/${policy.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...catalog.categories.map((category) => ({
      url: absoluteUrl(`/?category=${encodeURIComponent(category.slug)}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
  return pages;
}
