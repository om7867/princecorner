import type { Metadata } from "next";
import { getVenue } from "@/data/venues";
import { getVenueItems } from "@/lib/venue-items";
import { getSiteSettings } from "@/lib/site-settings";
import { PageUnavailable } from "@/components/ui/PageUnavailable";
import { RestaurantClient } from "./RestaurantClient";

const venue = getVenue("restaurant")!;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "The Restaurant",
    description: "Golden-hour lighting, hand-thrown ceramics, and a short seasonal menu cooked over fire.",
    alternates: { canonical: "/restaurant" },
    openGraph: {
      title: `The Restaurant — ${settings.name}`,
      description: "Golden-hour lighting, hand-thrown ceramics, and a short seasonal menu cooked over fire.",
      url: "/restaurant",
      images: [
        {
          url: venue.heroPhoto.src,
          width: 1200,
          height: 800,
          alt: venue.heroPhoto.alt,
        },
      ],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function RestaurantWorldPage() {
  const [items, settings] = await Promise.all([
    getVenueItems(venue.featuredIds),
    getSiteSettings({ fresh: true }),
  ]);

  if (settings.hidden_pages.includes("restaurant")) {
    return <PageUnavailable siteName={settings.name} />;
  }
  return <RestaurantClient items={items} siteName={settings.name} />;
}
