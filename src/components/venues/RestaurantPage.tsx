import Image from "next/image";
import Link from "next/link";
import {
  RESTAURANT_TASTING,
  RESTAURANT_HOURS,
  type Venue,
} from "@/data/venues";
import { getVenueItems } from "@/server/store";
import { VenueHero3D } from "@/components/scenes/VenueHero3D";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "./shared";

/** Dark, candlelit fine-dining theme — serif-heavy, gold on espresso. */
export async function RestaurantPage({ venue }: { venue: Venue }) {
  const items = await getVenueItems(venue.featuredIds);

  return (
    <main className="bg-[#181210] text-linen">
      <VenueHero3D
        venue={venue}
        signaturePhoto={items[0]?.photo.src ?? null}
        theme={{
          gradient: "from-[#241811] via-[#181210] to-[#100c0a]",
          dark: true,
          photoOpacity: "opacity-30",
        }}
      >
        <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
          Smaplee — {venue.tagline}
        </p>
        <h1 className="mt-5 text-balance font-display text-5xl italic text-linen sm:text-7xl">
          {venue.name}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-balance text-base text-linen/85 sm:text-lg lg:mx-0">
          {venue.intro}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
          <Link
            href="/#reservation"
            className="rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            Book the Dining Room
          </Link>
          <Link
            href="#tasting"
            className="rounded-full border border-linen/30 px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-colors duration-300 hover:border-linen/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linen"
          >
            See the Tasting Menu
          </Link>
        </div>
      </VenueHero3D>

      {/* ── Five-course tasting menu ── */}
      <section id="tasting" aria-label="Tasting menu" className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              {RESTAURANT_TASTING.price}
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen sm:text-5xl">
              {RESTAURANT_TASTING.title}
            </h2>
            <p className="mt-4 text-linen/60">{RESTAURANT_TASTING.note}</p>
          </div>

          <ol className="mt-16 space-y-0" role="list">
            {RESTAURANT_TASTING.courses.map((course, i) => (
              <li
                key={course.order}
                className={`flex items-baseline gap-6 py-7 sm:gap-10 ${
                  i > 0 ? "border-t border-linen/10" : ""
                }`}
              >
                <span className="w-8 shrink-0 font-display text-2xl italic text-saffron">
                  {course.order}
                </span>
                <div>
                  <h3 className="font-display text-xl text-linen">
                    {course.name}
                  </h3>
                  <p className="mt-1 text-sm text-linen/60">{course.dish}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Chef's word ── */}
      <section
        aria-label="From the chef"
        className="relative overflow-hidden px-6 py-24"
      >
        <div aria-hidden className="absolute inset-0">
          <Image
            src={venue.gallery[0].src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#181210] via-transparent to-[#181210]" />
        </div>
        <blockquote className="relative mx-auto max-w-2xl text-center">
          <p className="text-balance font-display text-2xl italic leading-relaxed text-linen sm:text-3xl">
            “A dish is ready when there is nothing left to take away. We cook
            slowly so that you can eat slowly.”
          </p>
          <footer className="mt-6 font-body text-xs uppercase tracking-[0.3em] text-saffron">
            — The Kitchen at Smaplee
          </footer>
        </blockquote>
      </section>

      {/* ── À la carte signatures ── */}
      <section aria-label="À la carte signatures" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              À La Carte
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen">
              The dishes people cross town for
            </h2>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {items.map((item) => (
              <li
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-linen/10 bg-[#221913] transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/50"
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
                    <h3 className="font-display text-lg text-linen">{item.name}</h3>
                    <span className="shrink-0 font-body text-sm font-semibold text-saffron">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-linen/60">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VenueGalleryBand
        venue={venue}
        tone="dark"
        title="The room at golden hour"
        accentClass="text-saffron"
      />

      {/* ── Private dining ── */}
      <section aria-label="Private dining" className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={venue.gallery[1].src}
              alt={venue.gallery[1].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              The Chef&apos;s Counter
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl italic text-linen sm:text-4xl">
              Twelve seats, one long evening
            </h2>
            <p className="mt-5 max-w-md text-linen/70">
              Our private counter faces the open fire. Twelve guests, a menu
              written that morning, and the cooks narrating every course.
              Available Thursday through Saturday — it books out about three
              weeks ahead.
            </p>
            <Link
              href="/#reservation"
              className="mt-8 inline-block rounded-full border border-saffron/60 px-8 py-3 font-body text-sm font-semibold text-saffron transition-colors duration-300 hover:bg-saffron hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Enquire About the Counter
            </Link>
          </div>
        </div>
      </section>

      {/* ── Hours ── */}
      <section aria-label="Hours" className="border-t border-linen/10 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl italic text-linen">Dinner hours</h2>
          <dl className="mt-10 space-y-4">
            {RESTAURANT_HOURS.map((row) => (
              <div
                key={row.days}
                className="flex items-baseline justify-between gap-6 border-b border-linen/10 pb-4 text-left"
              >
                <dt className="font-body text-sm font-medium text-linen/80">
                  {row.days}
                </dt>
                <dd className="font-body text-sm text-linen/60">{row.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <VenueFAQ venue={venue} tone="dark" accentClass="text-saffron" />

      <VenueCTABanner
        venue={venue}
        title="Tonight deserves a better table"
        subtitle="Walk-ins welcome, but the fire seats go fast. Book ahead and we'll have the bread warm when you arrive."
        primaryLabel="Reserve a Table"
      />
    </main>
  );
}
