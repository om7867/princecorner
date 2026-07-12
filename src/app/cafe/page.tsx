import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getVenue, CAFE_BREWS, CAFE_MORNING } from "@/data/venues";
import { getVenueItems } from "@/server/store";
import { WorldCanvas } from "@/scenes/core/WorldCanvas";
import { CafeWorld, CAFE_KEYFRAMES } from "@/scenes/worlds/CafeWorld";
import {
  WorldHero,
  WorldSection,
  WorldGap,
  GapCaption,
} from "@/components/worlds/shared";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "@/components/venues/shared";

export const metadata: Metadata = {
  title: "The Café",
  description:
    "Single-origin beans roasted in-house, milk steamed to silk. Your morning, slower.",
};

export const dynamic = "force-dynamic";

export default async function CafeWorldPage() {
  const venue = getVenue("cafe")!;
  const items = await getVenueItems(venue.featuredIds);

  return (
    <>
      <WorldCanvas
        keyframes={CAFE_KEYFRAMES}
        backdrop="bg-gradient-to-b from-[#f5eee3] via-[#efe4d0] to-[#e8dbc2]"
      >
        <CafeWorld />
      </WorldCanvas>

      <main className="relative z-10 text-charcoal">
        {/* 1 — Hero: across the sunlit counter */}
        <WorldHero dark={false} venue={venue}>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
            Smaplee — {venue.tagline}
          </p>
          <h1 className="mt-5 text-balance font-display text-5xl italic text-espresso sm:text-7xl">
            Your morning, slower
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-balance text-base text-espresso/80 sm:text-lg lg:mx-0">
            {venue.intro}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/order?table=T1"
              className="rounded-full bg-terracotta px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              Order Ahead
            </Link>
            <Link
              href="#brews"
              className="rounded-full border border-espresso/25 px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-colors duration-300 hover:border-espresso/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
            >
              See the Menu
            </Link>
          </div>
        </WorldHero>

        {/* 2 — The beans */}
        <WorldSection ariaLabel="The beans" tone="light">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              The Beans
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso">
              Three weeks from farm to cup
            </h2>
            <p className="mt-6 text-espresso/70">
              A single-origin lot from a farm we can name, roasted twenty steps
              from where it&apos;s poured, rested three days, and dialed in
              before the doors open. Whatever you order, it was a green bean
              less than a month ago.
            </p>
          </div>
        </WorldSection>

        {/* 3 — Camera glides along the drinks line */}
        <GapCaption dark={false} eyebrow="Down the counter" title="Every cup on the line this morning" />
        <WorldGap h="h-[85vh]" />

        {/* 4 — Brew bar */}
        <WorldSection id="brews" ariaLabel="The brew bar" tone="light">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
                The Brew Bar
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-espresso">
                Four ways to take your coffee
              </h2>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2" role="list">
              {CAFE_BREWS.map((brew) => (
                <li
                  key={brew.name}
                  className="rounded-3xl border border-espresso/10 bg-linen-soft/90 p-6 transition-shadow duration-500 hover:shadow-lg hover:shadow-espresso/5"
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
        </WorldSection>

        {/* 5 — Camera turns to the pastry case */}
        <GapCaption dark={false} eyebrow="The case" title="Still warm from the oven next door" />
        <WorldGap h="h-[75vh]" />

        <WorldSection ariaLabel="Counter favourites" tone="light">
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
                  className="group overflow-hidden rounded-3xl border border-espresso/10 bg-linen-soft/95 transition-transform duration-500 ease-[var(--ease-cubic)] hover:-translate-y-1 hover:shadow-xl hover:shadow-espresso/10"
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
        </WorldSection>

        {/* 6 — Morning timeline */}
        <WorldSection ariaLabel="A café morning" tone="light">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
                Open Daily From 7am
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-espresso">
                How a morning here goes
              </h2>
            </div>
            <ol className="mt-12 space-y-7" role="list">
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
        </WorldSection>

        {/* 7 — Coffee club */}
        <WorldSection ariaLabel="Coffee club" tone="light">
          <div className="mx-auto max-w-2xl rounded-3xl border border-terracotta/20 bg-linen-soft/90 p-10 text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              The Coffee Club
            </p>
            <h2 className="mt-4 font-display text-3xl italic text-espresso">
              Ninth cup on the house
            </h2>
            <p className="mx-auto mt-4 max-w-md text-espresso/70">
              A paper stamp card, like it should be. Take home a 250g bag of
              this week&apos;s roast and get two stamps — ask the barista
              what they&apos;re drinking; it&apos;s usually the right answer.
            </p>
            <Link
              href="/reserve"
              className="mt-7 inline-block rounded-full bg-terracotta px-8 py-3 font-body text-sm font-semibold text-linen transition-transform duration-300 hover:scale-105"
            >
              Come In and Join
            </Link>
          </div>
        </WorldSection>

        {/* 8 — Gallery + FAQ + CTA */}
        <div className="bg-linen/90 backdrop-blur-md">
          <VenueGalleryBand
            venue={venue}
            tone="light"
            eyebrow="The Space"
            title="Sun, steam, and somewhere to sit"
            accentClass="text-terracotta"
          />
          <VenueFAQ venue={venue} tone="light" accentClass="text-terracotta" />
        </div>

        <VenueCTABanner
          venue={venue}
          title="Tomorrow morning, then?"
          subtitle="First batch of filter is brewed by 7. The window seats go to the early risers."
          primaryLabel="Reserve a Spot"
        />
      </main>
    </>
  );
}
