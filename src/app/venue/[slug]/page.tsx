import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VENUES, getVenue, type VenueSlug } from "@/data/venues";
import { RestaurantPage } from "@/components/venues/RestaurantPage";
import { CafePage } from "@/components/venues/CafePage";
import { BarPage } from "@/components/venues/BarPage";
import { BakeryPage } from "@/components/venues/BakeryPage";

type Props = { params: Promise<{ slug: string }> };

/** Menu content is admin-editable at runtime, so venue pages render per-request. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return VENUES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenue(slug);
  if (!venue) return {};
  return {
    title: `${venue.name} — Smaplee`,
    description: venue.intro,
  };
}

const PAGES: Record<VenueSlug, typeof RestaurantPage> = {
  restaurant: RestaurantPage,
  cafe: CafePage,
  bar: BarPage,
  bakery: BakeryPage,
};

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const venue = getVenue(slug);
  if (!venue) notFound();
  const Page = PAGES[venue.slug];
  return <Page venue={venue} />;
}
