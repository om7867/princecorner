import Image from "next/image";
import Link from "next/link";
import {
  CAFE_BREWS,
  CAFE_MORNING,
  type Venue,
} from "@/data/venues";
import { getVenueItems } from "@/server/store";
import { VenueHero3D } from "@/components/scenes/VenueHero3D";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "./shared";

/** Bright, sunlit morning theme — cream and terracotta, airy spacing. */
export async function CafePage({ venue }: { venue: Venue }) {
  const items = await getVenueItems(venue.featuredIds);

  return (
    <main className="bg-linen text-charcoal">
      <VenueHero3D
        venue={venue}
        signaturePhoto={items[0]?.photo.src ?? null}
        theme={{
          gradient: "from-[#f5eee3] via-[#efe4d0] to-[#e8dbc2]",
          dark: false,
          photoOpacity: "opacity-30",
        }}
      >
        <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
          Smaplee — {venue.tagline}
        </p>
        <h1 className="mt-5 text-balance font-display text-5xl italic text-espresso sm:text-7xl">
          {venue.name}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-balance text-base text-espresso/80 sm:text-lg lg:mx-0">
          {venue.intro}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
          <Link
            href="/#reservation"
            className="rounded-full bg-terracotta px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            Hold a Morning Table
          </Link>
          <Link
            href="#brews"
            className="rounded-full border border-espresso/25 px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-colors duration-300 hover:border-espresso/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            See the Brew Bar
          </Link>
        </div>
      </VenueHero3D>

      {/* ── The brew bar ── */}
      <section id="brews" aria-label="The brew bar" className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              The Brew Bar
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso sm:text-5xl">
              Four ways to take your coffee
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-espresso/70">
              Beans roasted in-house every Tuesday. Whatever you order, it was
              a green bean less than three weeks ago.
            </p>
          </div>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2" role="list">
            {CAFE_BREWS.map((brew) => (
              <li
                key={brew.name}
                className="rounded-3xl border border-espresso/10 bg-linen-soft p-6 transition-shadow duration-500 hover:shadow-lg hover:shadow-espresso/5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl text-espresso">{brew.name}</h3>
                  <span className="shrink-0 font-body text-sm font-semibold text-terracotta">
                    {brew.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-espresso/70">{brew.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── A café morning, hour by hour ── */}
      <section
        aria-label="A café morning"
        className="bg-[#efe4d0] px-6 py-24"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              Open Daily From 7am
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso">
              How a morning here goes
            </h2>
          </div>
          <ol className="mt-14 space-y-8" role="list">
            {CAFE_MORNING.map((slot) => (
              <li key={slot.time} className="flex items-baseline gap-6 sm:gap-10">
                <span className="w-16 shrink-0 text-right font-display text-2xl italic text-terracotta">
                  {slot.time}
                </span>
                <p className="border-l-2 border-terracotta/30 pl-6 text-espresso/80">
                  {slot.event}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Counter favourites ── */}
      <section aria-label="Counter favourites" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              From the Counter
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso">
              Best enjoyed before noon
            </h2>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {items.map((item) => (
              <li
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-espresso/10 bg-linen-soft transition-shadow duration-500 hover:shadow-xl hover:shadow-espresso/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg text-espresso">{item.name}</h3>
                    <span className="shrink-0 font-body text-sm font-semibold text-terracotta">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-espresso/70">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VenueGalleryBand
        venue={venue}
        tone="light"
        eyebrow="The Counter"
        title="Sunlight, steam, and second helpings"
        accentClass="text-terracotta"
      />

      {/* ── Beans to take home ── */}
      <section aria-label="Take our beans home" className="bg-espresso px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              The Roastery Shelf
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl italic text-linen sm:text-4xl">
              Take the morning home with you
            </h2>
            <p className="mt-5 max-w-md text-linen/70">
              250g bags of whatever we roasted this week — whole bean or ground
              to your brewer. Ask the barista what they&apos;re drinking; it&apos;s
              usually the right answer.
            </p>
            <Link
              href="/#reservation"
              className="mt-8 inline-block rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold text-espresso transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Visit the Café
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={venue.gallery[0].src}
              alt={venue.gallery[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <VenueFAQ venue={venue} tone="light" accentClass="text-terracotta" />

      <VenueCTABanner
        venue={venue}
        title="Tomorrow starts better here"
        subtitle="First filter is brewed by seven, pastries land warm at half past. Save yourself a seat by the window."
        primaryLabel="Hold a Morning Table"
      />
    </main>
  );
}
