import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The admin panel, API, and per-table ordering app are utility surfaces —
    // keep crawlers on the marketing pages.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/order"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
