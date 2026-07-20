import type { Metadata } from "next";
import { getVenue } from "@/data/venues";
import { getVenueItems } from "@/lib/venue-items";
import { getSiteSettings } from "@/lib/site-settings";
import { CafeClient } from "./CafeClient";

const venue = getVenue("cafe")!;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "The Café",
    description: "Single-origin beans roasted in-house, milk steamed to silk. Your morning, slower.",
    alternates: { canonical: "/cafe" },
    openGraph: {
      title: `The Café — ${settings.name}`,
      description: "Single-origin beans roasted in-house, milk steamed to silk. Your morning, slower.",
      url: "/cafe",
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

export default async function CafeWorldPage() {
  const [items, settings] = await Promise.all([
    getVenueItems(venue.featuredIds),
    getSiteSettings(),
  ]);

  return <CafeClient items={items} siteName={settings.name} />;
}
