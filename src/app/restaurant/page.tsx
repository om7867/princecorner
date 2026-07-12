import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getVenue, RESTAURANT_TASTING, RESTAURANT_HOURS } from "@/data/venues";
import { getVenueItems } from "@/server/store";
import { WorldCanvas } from "@/scenes/core/WorldCanvas";
import {
  RestaurantWorld,
  RESTAURANT_KEYFRAMES,
} from "@/scenes/worlds/RestaurantWorld";
import {
  WorldHero,
  WorldSection,
  WorldGap,
  GapCaption,
} from "@/components/worlds/shared";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "@/components/venues/shared";

export const metadata: Metadata = {
  title: "The Restaurant",
  description:
    "Golden-hour lighting, hand-thrown ceramics, and a short seasonal menu cooked over fire.",
};

export const dynamic = "force-dynamic";

const WINES = [
  { name: "Skin-contact Rhône white", note: "For the octopus — saline, apricot" },
  { name: "Old-vine Grenache", note: "For the lamb — dark cherry, woodsmoke" },
  { name: "Vintage Bual Madeira", note: "For the chocolate tart — burnt caramel" },
];

export default async function RestaurantWorldPage() {
  const venue = getVenue("restaurant")!;
  const items = await getVenueItems(venue.featuredIds);

  return (
    <>
      <WorldCanvas
        keyframes={RESTAURANT_KEYFRAMES}
        backdrop="bg-gradient-to-b from-[#241811] via-[#181210] to-[#100c0a]"
      >
        <RestaurantWorld />
      </WorldCanvas>

      <main className="relative z-10 text-linen">
        {/* 1 — Hero: establishing shot, camera high over the table */}
        <WorldHero dark venue={venue}>
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
              href="/reserve"
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
        </WorldHero>

        {/* 2 — Our story: camera leans into the hero dish behind this panel */}
        <WorldSection ariaLabel="Our philosophy" tone="dark">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              The Philosophy
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen">
              Cooked over fire, served without hurry
            </h2>
            <p className="mt-6 text-linen/70">
              One room, one fire, one seating a night. The menu is written
              each morning from whatever the market gave us, and every plate
              is finished by hand at the pass — you&apos;ll watch it happen.
            </p>
          </div>
        </WorldSection>

        {/* 3 — Camera trucks along the five courses laid on the 3D table */}
        <GapCaption dark eyebrow="Look down the table" title="Five courses, laid out in front of you" />
        <WorldGap h="h-[85vh]" />

        {/* 4 — The tasting menu */}
        <WorldSection id="tasting" ariaLabel="Tasting menu" tone="dark">
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
            <ol className="mt-14" role="list">
              {RESTAURANT_TASTING.courses.map((course, i) => (
                <li
                  key={course.order}
                  className={`flex items-baseline gap-6 py-6 sm:gap-10 ${i > 0 ? "border-t border-linen/10" : ""}`}
                >
                  <span className="w-8 shrink-0 font-display text-2xl italic text-saffron">
                    {course.order}
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-linen">{course.name}</h3>
                    <p className="mt-1 text-sm text-linen/60">{course.dish}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </WorldSection>

        {/* 5 — À la carte */}
        <WorldSection ariaLabel="À la carte signatures" tone="dark">
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
                  className="group overflow-hidden rounded-3xl border border-linen/10 bg-[#221913]/90 transition-transform duration-500 ease-[var(--ease-cubic)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
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
        </WorldSection>

        {/* 6 — Camera turns to the fire-lit kitchen pass */}
        <GapCaption dark eyebrow="The pass" title="Where every plate is finished" />
        <WorldGap h="h-[75vh]" />

        <WorldSection ariaLabel="From the chef" tone="dark">
          <blockquote className="mx-auto max-w-2xl text-center">
            <p className="text-balance font-display text-2xl italic leading-relaxed text-linen sm:text-3xl">
              “A dish is ready when there is nothing left to take away. We
              cook slowly so that you can eat slowly.”
            </p>
            <footer className="mt-6 font-body text-xs uppercase tracking-[0.3em] text-saffron">
              — The Kitchen at Smaplee
            </footer>
          </blockquote>
        </WorldSection>

        {/* 7 — Camera drifts to the wine wall */}
        <GapCaption dark eyebrow="The cellar wall" title="Forty bottles, three of them perfect for tonight" />
        <WorldGap h="h-[75vh]" />

        <WorldSection ariaLabel="Wine and pairings" tone="dark">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
                Wine &amp; Pairings
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-linen">
                Poured to match the fire
              </h2>
            </div>
            <ul className="mt-12" role="list">
              {WINES.map((wine, i) => (
                <li
                  key={wine.name}
                  className={`flex items-baseline justify-between gap-6 py-5 ${i > 0 ? "border-t border-linen/10" : ""}`}
                >
                  <h3 className="font-display text-lg text-linen">{wine.name}</h3>
                  <p className="text-right text-sm text-linen/60">{wine.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center text-sm text-linen/50">
              Full pairing flight +$45 with the tasting menu.
            </p>
          </div>
        </WorldSection>

        {/* 8 — Gallery, FAQ */}
        <div className="bg-[#181210]/90 backdrop-blur-md">
          <VenueGalleryBand
            venue={venue}
            tone="dark"
            title="The room at golden hour"
            accentClass="text-saffron"
          />
          <VenueFAQ venue={venue} tone="dark" accentClass="text-saffron" />
        </div>

        {/* 9 — Hours + closing CTA */}
        <WorldSection ariaLabel="Hours" tone="dark">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl italic text-linen">Dinner hours</h2>
            <dl className="mt-10 space-y-4">
              {RESTAURANT_HOURS.map((row) => (
                <div
                  key={row.days}
                  className="flex items-baseline justify-between gap-6 border-b border-linen/10 pb-4 text-left"
                >
                  <dt className="font-body text-sm font-medium text-linen/80">{row.days}</dt>
                  <dd className="font-body text-sm text-linen/60">{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </WorldSection>

        <VenueCTABanner
          venue={venue}
          title="Tonight deserves a better table"
          subtitle="Walk-ins welcome, but the fire seats go fast. Book ahead and we'll have the bread warm when you arrive."
          primaryLabel="Reserve a Table"
        />
      </main>
    </>
  );
}
