import Image from "next/image";
import Link from "next/link";
import type { Venue } from "@/data/venues";

type Tone = "dark" | "light";

/** Three-photo ambience band with a staggered middle image. */
export function VenueGalleryBand({
  venue,
  tone,
  eyebrow = "The Room",
  title,
  accentClass,
}: {
  venue: Venue;
  tone: Tone;
  eyebrow?: string;
  title: string;
  accentClass: string;
}) {
  const heading = tone === "dark" ? "text-linen" : "text-espresso";
  return (
    <section aria-label={`${venue.name} gallery`} className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className={`font-body text-xs uppercase tracking-[0.35em] ${accentClass}`}>
            {eyebrow}
          </p>
          <h2 className={`mt-4 text-balance font-display text-4xl italic ${heading}`}>
            {title}
          </h2>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-3" role="list">
          {venue.gallery.map((photo, i) => (
            <li
              key={photo.src}
              className={`relative aspect-[3/4] overflow-hidden rounded-3xl ${
                i === 1 ? "sm:mt-10" : ""
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] hover:scale-105"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Accessible FAQ accordion using native details/summary. */
export function VenueFAQ({
  venue,
  tone,
  accentClass,
}: {
  venue: Venue;
  tone: Tone;
  accentClass: string;
}) {
  const heading = tone === "dark" ? "text-linen" : "text-espresso";
  const body = tone === "dark" ? "text-linen/65" : "text-espresso/70";
  const border = tone === "dark" ? "border-linen/10" : "border-espresso/10";
  const hoverBg = tone === "dark" ? "hover:bg-linen/5" : "hover:bg-espresso/5";

  return (
    <section aria-label="Frequently asked questions" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className={`font-body text-xs uppercase tracking-[0.35em] ${accentClass}`}>
            Good to Know
          </p>
          <h2 className={`mt-4 font-display text-4xl italic ${heading}`}>
            Questions, answered
          </h2>
        </div>
        <div className="mt-12">
          {venue.faqs.map((faq) => (
            <details
              key={faq.q}
              className={`group border-b ${border} transition-colors ${hoverBg}`}
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-4 px-2 py-5 font-display text-lg ${heading} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron [&::-webkit-details-marker]:hidden`}
              >
                {faq.q}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                  className="shrink-0 transition-transform duration-300 ease-[var(--ease-cubic)] group-open:rotate-45"
                >
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </summary>
              <p className={`px-2 pb-6 text-sm leading-relaxed ${body}`}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Full-width closing CTA over the venue's hero photo. */
export function VenueCTABanner({
  venue,
  title,
  subtitle,
  primaryLabel,
}: {
  venue: Venue;
  title: string;
  subtitle: string;
  primaryLabel: string;
}) {
  return (
    <section
      aria-label={`Visit ${venue.name}`}
      className="relative overflow-hidden px-6 py-28"
    >
      <div aria-hidden className="absolute inset-0">
        <Image
          src={venue.heroPhoto.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-espresso/75" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${venue.accent}35, transparent 60%)`,
          }}
        />
      </div>
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-4xl italic text-linen sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-balance text-linen/80">{subtitle}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/#reservation"
            className="rounded-full bg-saffron px-9 py-3.5 font-body text-sm font-semibold tracking-wide text-espresso transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            {primaryLabel}
          </Link>
          <a
            href={`tel:${venue.quickInfo.phone.replace(/[^+\d]/g, "")}`}
            className="rounded-full border border-linen/40 px-9 py-3.5 font-body text-sm font-semibold tracking-wide text-linen transition-colors duration-300 hover:border-linen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linen"
          >
            Call {venue.quickInfo.phone}
          </a>
        </div>
        <p className="mt-6 font-body text-xs uppercase tracking-[0.25em] text-linen/50">
          {venue.quickInfo.hours} · {venue.quickInfo.address}
        </p>
      </div>
    </section>
  );
}
