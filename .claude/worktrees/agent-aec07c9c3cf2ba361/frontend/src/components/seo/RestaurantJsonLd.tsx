import { SITE_URL } from "@/lib/env";
import { getSiteSettings } from "@/lib/site-settings";
import { unsplash } from "@/lib/unsplash";

/**
 * schema.org Restaurant markup — earns the rich Google result with hours,
 * price range, and a reserve link. Values flow from admin-editable Settings.
 */
export async function RestaurantJsonLd() {
  const settings = await getSiteSettings();

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.name,
    description: settings.description,
    url: SITE_URL,
    telephone: settings.phone,
    email: settings.email,
    image: [unsplash("1414235077428-338989a2e8c0", 1200)],
    servesCuisine: ["Modern European", "Coffee", "Cocktails", "Bakery"],
    priceRange: "$$",
    acceptsReservations: "True",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address_street,
      addressLocality: settings.address_area,
      addressRegion: settings.address_city,
    },
    openingHoursSpecification: settings.hours.map((row) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: row.days,
      description: row.time,
    })),
    hasMenu: `${SITE_URL}/menu`,
    potentialAction: {
      "@type": "ReserveAction",
      target: `${SITE_URL}/reserve`,
      name: "Reserve a table",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
