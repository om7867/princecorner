import { SITE } from "@/data/site";
import { unsplash } from "@/data/menu";

/**
 * schema.org Restaurant markup — earns the rich Google result with hours,
 * price range, and a reserve link. Values flow from the site config.
 */
export function RestaurantJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    image: [unsplash("1414235077428-338989a2e8c0", 1200)],
    servesCuisine: ["Modern European", "Coffee", "Cocktails", "Bakery"],
    priceRange: "$$",
    acceptsReservations: "True",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.area,
      addressRegion: SITE.address.city,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "23:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "24:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "08:00",
        closes: "21:00",
      },
    ],
    hasMenu: `${SITE.url}/menu`,
    potentialAction: {
      "@type": "ReserveAction",
      target: `${SITE.url}/reserve`,
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
