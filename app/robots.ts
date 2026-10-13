import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/order/", "/track/"],
    },
    sitemap: `${site}/sitemap.xml`,
    host: new URL(site).host,
  };
}
