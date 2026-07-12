import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getVenue, BAR_COCKTAILS, BAR_LIBRARY, BAR_NIGHTS } from "@/data/venues";
import { getVenueItems } from "@/server/store";
import { WorldCanvas } from "@/scenes/core/WorldCanvas";
import { BarWorld, BAR_KEYFRAMES } from "@/scenes/worlds/BarWorld";
import {
  WorldHero,
  WorldSection,
  WorldGap,
  GapCaption,
} from "@/components/worlds/shared";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "@/components/venues/shared";

export const metadata: Metadata = {
  title: "The Bar",
  description:
    "Applewood smoke, garden herbs, and spirits worth sipping. Smaplee after dark.",
};

export const dynamic = "force-dynamic";

export default async function BarWorldPage() {
  const venue = getVenue("bar")!;
  const items = await getVenueItems(venue.featuredIds);

  return (
    <>
      <WorldCanvas
        keyframes={BAR_KEYFRAMES}
        backdrop="bg-gradient-to-b from-[#101416] via-[#0a0c0d] to-[#070808]"
      >
        <BarWorld />
      </WorldCanvas>

      <main className="relative z-10 text-linen">
        {/* 1 — Hero: close on the lit cocktail */}
        <WorldHero dark venue={venue}>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
            Smaplee — {venue.tagline}
          </p>
          <h1 className="mt-5 text-balance font-display text-5xl italic text-linen sm:text-7xl">
            Smaplee after dark
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-balance text-base text-linen/85 sm:text-lg lg:mx-0">
            {venue.intro}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/reserve"
              className="rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Claim a Corner
            </Link>
            <Link
              href="#cocktails"
              className="rounded-full border border-linen/30 px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-colors duration-300 hover:border-linen/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linen"
            >
              See Cocktails
            </Link>
          </div>
        </WorldHero>

        {/* 2 — Camera pulls back over the line of drinks */}
        <GapCaption dark eyebrow="The counter" title="Five drinks, built like rituals" />
        <WorldGap h="h-[80vh]" />

        {/* 3 — Cocktail list */}
        <WorldSection id="cocktails" ariaLabel="Cocktail list" tone="dark">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
                The List
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-linen sm:text-5xl">
                Signature cocktails
              </h2>
            </div>
            <ol className="mt-14" role="list">
              {BAR_COCKTAILS.map((drink, i) => (
                <li
                  key={drink.num}
                  className={`group flex items-baseline gap-6 py-6 sm:gap-10 ${i > 0 ? "border-t border-linen/10" : ""}`}
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
        </WorldSection>

        {/* 4 — Camera trucks along the glowing back bar */}
        <GapCaption dark eyebrow="The back bar" title="Every bottle lit like it earned it" />
        <WorldGap h="h-[85vh]" />

        <WorldSection ariaLabel="The back bar library" tone="dark">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
                The Back Bar
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-linen">
                Forty-one bottles worth sipping slowly
              </h2>
            </div>
            <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BAR_LIBRARY.map((row) => (
                <div
                  key={row.category}
                  className="rounded-3xl border border-linen/10 bg-[#161310]/90 p-6 text-center"
                >
                  <dt className="font-display text-lg text-linen">{row.category}</dt>
                  <dd className="mt-2 font-body text-sm text-sage">{row.count}</dd>
                </div>
              ))}
            </dl>
          </div>
        </WorldSection>

        {/* 5 — Small plates */}
        <WorldSection ariaLabel="Small plates" tone="dark">
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
                  className="group overflow-hidden rounded-3xl border border-linen/10 bg-[#161310]/90 transition-transform duration-500 ease-[var(--ease-cubic)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60"
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
        </WorldSection>

        {/* 6 — Camera turns to the stage corner */}
        <GapCaption dark eyebrow="The corner stage" title="Thursday: the trio tunes up at eight" />
        <WorldGap h="h-[70vh]" />

        <WorldSection ariaLabel="Nights at the bar" tone="dark">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-sage">
                The Week
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-linen">
                Nights worth planning around
              </h2>
            </div>
            <ul className="mt-12 space-y-5" role="list">
              {BAR_NIGHTS.map((row) => (
                <li
                  key={row.night}
                  className="flex flex-col gap-1 rounded-3xl border border-linen/10 bg-[#161310]/90 p-6 sm:flex-row sm:items-baseline sm:gap-8"
                >
                  <span className="w-28 shrink-0 font-display text-xl italic text-saffron">
                    {row.night}
                  </span>
                  <p className="text-linen/70">{row.event}</p>
                </li>
              ))}
            </ul>
          </div>
        </WorldSection>

        {/* 7 — Gallery + FAQ + CTA */}
        <div className="bg-[#0f0d0b]/90 backdrop-blur-md">
          <VenueGalleryBand
            venue={venue}
            tone="dark"
            eyebrow="Low Light"
            title="The kind of dark you dress up for"
            accentClass="text-sage"
          />
          <VenueFAQ venue={venue} tone="dark" accentClass="text-sage" />
        </div>

        <VenueCTABanner
          venue={venue}
          title="Save us the corner booth"
          subtitle="Walk-ins take the bar; the booths go to the planners. Golden hour starts Friday at five."
          primaryLabel="Reserve a Table"
        />
      </main>
    </>
  );
}
