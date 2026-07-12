import Image from "next/image";
import Link from "next/link";
import {
  BAKERY_SCHEDULE,
  BAKERY_BREADS,
  type Venue,
} from "@/data/venues";
import { getVenueItems } from "@/server/store";
import { VenueHero3D } from "@/components/scenes/VenueHero3D";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "./shared";

/** Rustic flour-dusted theme — warm golds, paper textures, hand-set rhythm. */
export async function BakeryPage({ venue }: { venue: Venue }) {
  const items = await getVenueItems(venue.featuredIds);

  return (
    <main className="bg-[#f2e7d3] text-charcoal">
      <VenueHero3D
        venue={venue}
        signaturePhoto={items[0]?.photo.src ?? null}
        theme={{
          gradient: "from-[#eddcc0] via-[#e8d3ae] to-[#dfc79e]",
          dark: false,
          photoOpacity: "opacity-35",
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
            className="rounded-full bg-espresso px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            Order Ahead
          </Link>
          <Link
            href="#breads"
            className="rounded-full border border-espresso/25 px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-colors duration-300 hover:border-espresso/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            Today&apos;s Bake
          </Link>
        </div>
      </VenueHero3D>

      {/* ── The day, by the oven clock ── */}
      <section aria-label="Daily bake schedule" className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              By the Oven Clock
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso sm:text-5xl">
              A day at the bakery
            </h2>
          </div>
          <ol className="mt-16 space-y-0" role="list">
            {BAKERY_SCHEDULE.map((slot, i) => (
              <li
                key={slot.time}
                className={`flex items-baseline gap-6 py-6 sm:gap-10 ${
                  i > 0 ? "border-t border-espresso/10" : ""
                }`}
              >
                <span className="w-16 shrink-0 text-right font-display text-2xl italic text-terracotta">
                  {slot.time}
                </span>
                <p className="text-espresso/80">{slot.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Bread lineup ── */}
      <section id="breads" aria-label="The bread lineup" className="bg-[#eaddc2] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              The Lineup
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso">
              What&apos;s on the shelf
            </h2>
            <p className="mx-auto mt-4 max-w-md text-espresso/70">
              Reserve a loaf by 4pm the day before and we&apos;ll hold it past
              the noon rush.
            </p>
          </div>
          <ul className="mt-14" role="list">
            {BAKERY_BREADS.map((bread, i) => (
              <li
                key={bread.name}
                className={`flex items-baseline gap-4 py-5 ${
                  i > 0 ? "border-t border-dashed border-espresso/20" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl text-espresso">{bread.name}</h3>
                  <p className="mt-0.5 text-sm text-espresso/60">{bread.detail}</p>
                </div>
                <span className="shrink-0 font-body text-sm font-semibold text-terracotta">
                  {bread.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Sweet counter ── */}
      <section aria-label="Sweet counter" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              The Sweet Counter
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso">
              Worth ruining dinner for
            </h2>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {items.map((item) => (
              <li
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-espresso/10 bg-[#f8f1e4] transition-shadow duration-500 hover:shadow-xl hover:shadow-espresso/10"
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
        eyebrow="Flour Everywhere"
        title="Crust, crumb, and quiet pride"
        accentClass="text-terracotta"
      />

      {/* ── Wholesale / events ── */}
      <section aria-label="Wholesale and events" className="bg-espresso px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={venue.gallery[0].src}
              alt={venue.gallery[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              Beyond the Counter
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl italic text-linen sm:text-4xl">
              Bread for your table, or your restaurant&apos;s
            </h2>
            <p className="mt-5 max-w-md text-linen/70">
              We bake for a handful of kitchens around the neighborhood and for
              weddings, dinners, and anyone who believes a good loaf changes
              the whole meal. Standing orders welcome.
            </p>
            <Link
              href="/#reservation"
              className="mt-8 inline-block rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold text-espresso transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Talk to the Bakers
            </Link>
          </div>
        </div>
      </section>

      <VenueFAQ venue={venue} tone="light" accentClass="text-terracotta" />

      <VenueCTABanner
        venue={venue}
        title="Set your alarm, or lose the levain"
        subtitle="The shelves empty by noon most days. Order ahead and your loaf waits for you — warm side up."
        primaryLabel="Order Ahead"
      />
    </main>
  );
}
