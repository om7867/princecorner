import { SITE } from "@/data/site";

/**
 * schema.org VideoObject for the scroll-scrubbed world films — lets the
 * footage surface in video search results with a proper thumbnail.
 */
export function VideoJsonLd({
  name,
  description,
  contentUrl,
  thumbnailUrl,
  duration,
}: {
  name: string;
  description: string;
  /** Site-relative path to the mp4, e.g. "/cafe-film.mp4". */
  contentUrl: string;
  /** Site-relative path to the poster frame. */
  thumbnailUrl: string;
  /** ISO 8601, e.g. "PT10S". */
  duration: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    contentUrl: `${SITE.url}${contentUrl}`,
    thumbnailUrl: `${SITE.url}${thumbnailUrl}`,
    uploadDate: "2026-07-14",
    duration,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
