import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { VENUES } from "@/data/venues";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...VENUES.map((venue) => ({
      url: `${SITE.url}/${venue.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE.url}/menu`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE.url}/reserve`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
  ];
}
