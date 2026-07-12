import Image from "next/image";
import Link from "next/link";
import {
  BAR_COCKTAILS,
  BAR_LIBRARY,
  BAR_NIGHTS,
  type Venue,
} from "@/data/venues";
import { getVenueItems } from "@/server/store";
import { VenueHero3D } from "@/components/scenes/VenueHero3D";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "./shared";

/** Low-lit, late-night theme — near-black with sage and amber accents. */
export async function BarPage({ venue }: { venue: Venue }) {
  const items = await getVenueItems(venue.featuredIds);

  return (
    <main className="bg-[#0f0d0b] text-linen">
      <VenueHero3D
        venue={venue}
        signaturePhoto={items[0]?.photo.src ?? null}
        theme={{
          gradient: "from-[#16130f] via-[#0f0d0b] to-[#0a0908]",
          dark: true,
          photoOpacity: "opacity-35",
        }}
      >
        <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
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
            Claim a Corner
          </Link>
          <Link
            href="#cocktails"
            className="rounded-full border border-linen/30 px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-colors duration-300 hover:border-linen/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linen"
          >
            See the List
          </Link>
        </div>
      </VenueHero3D>

      {/* ── The list ── */}
      <section id="cocktails" aria-label="Cocktail list" className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
              The List
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen sm:text-5xl">
              Five drinks, built like rituals
            </h2>
          </div>

          <ol className="mt-16" role="list">
            {BAR_COCKTAILS.map((drink, i) => (
              <li
                key={drink.num}
                className={`group flex items-baseline gap-6 py-7 sm:gap-10 ${
                  i > 0 ? "border-t border-linen/10" : ""
                }`}
              >
                <span className="w-10 shrink-0 font-display text-xl italic text-sage transition-colors group-hover:text-saffron">
                  {drink.num}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl text-linen">{drink.name}</h3>
                  <p className="mt-1 text-sm text-linen/55">{drink.detail}</p>
                </div>
                <span className="shrink-0 font-body text-sm font-semibold text-saffron">
                  {drink.price}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Back bar library ── */}
      <section
        aria-label="The back bar"
        className="relative overflow-hidden px-6 py-24"
      >
        <div aria-hidden className="absolute inset-0">
          <Image
            src={venue.heroPhoto.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0d0b] via-transparent to-[#0f0d0b]" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
              The Back Bar
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen">
              Forty-one bottles worth sipping slowly
            </h2>
          </div>
          <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BAR_LIBRARY.map((row) => (
              <div
                key={row.category}
                className="rounded-3xl border border-linen/10 bg-[#161310]/80 p-6 text-center backdrop-blur-sm"
              >
                <dt className="font-display text-lg text-linen">{row.category}</dt>
                <dd className="mt-2 font-body text-sm text-sage">{row.count}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Featured pours & plates ── */}
      <section aria-label="Featured pours and plates" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
              While You Sip
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen">
              Small plates for long nights
            </h2>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {items.map((item) => (
              <li
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-linen/10 bg-[#161310] transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/60"
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
                  <p className="mt-1.5 text-sm text-linen/55">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VenueGalleryBand
        venue={venue}
        tone="dark"
        eyebrow="After Dark"
        title="Low light, long pours"
        accentClass="text-sage"
      />

      {/* ── Nights ── */}
      <section aria-label="Nights at the bar" className="border-t border-linen/10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
              The Week
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen">
              Nights worth planning around
            </h2>
          </div>
          <ul className="mt-14 space-y-6" role="list">
            {BAR_NIGHTS.map((row) => (
              <li
                key={row.night}
                className="flex flex-col gap-1 rounded-3xl border border-linen/10 bg-[#161310] p-6 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="w-28 shrink-0 font-display text-xl italic text-saffron">
                  {row.night}
                </span>
                <p className="text-linen/70">{row.event}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VenueFAQ venue={venue} tone="dark" accentClass="text-sage" />

      <VenueCTABanner
        venue={venue}
        title="The good corner is still free"
        subtitle="Booths book out by Thursday afternoon. The bar itself is first come, best seated."
        primaryLabel="Book a Booth"
      />
    </main>
  );
}
