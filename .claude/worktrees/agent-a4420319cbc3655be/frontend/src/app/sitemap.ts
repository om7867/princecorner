import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { VENUES } from "@/data/venues";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...VENUES.map((venue) => ({
      url: `${SITE_URL}/${venue.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/menu`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/reserve`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
  ];
}
