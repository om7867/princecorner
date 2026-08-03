import { notFound, permanentRedirect } from "next/navigation";
import { VENUES, getVenue } from "@/data/venues";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return VENUES.map((v) => ({ slug: v.slug }));
}

/** Venue pages moved to top-level 3D world routes (/restaurant, /cafe, …). */
export default async function VenueRedirect({ params }: Props) {
  const { slug } = await params;
  if (!getVenue(slug)) notFound();
  permanentRedirect(`/${slug}`);
}
