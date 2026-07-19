import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getVenue, RESTAURANT_TASTING, RESTAURANT_HOURS } from "@/data/venues";
import { getVenueItems } from "@/lib/venue-items";
import { getSiteSettings } from "@/lib/site-settings";
import { formatMoney } from "@/lib/types";
import { ScrollFilm } from "@/components/worlds/ScrollFilm";
import {
  WorldHero,
  WorldSection,
  WorldGap,
  GapCaption,
} from "@/components/worlds/shared";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "@/components/venues/shared";
import { VideoJsonLd } from "@/components/seo/VideoJsonLd";

const venue = getVenue("restaurant")!;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "The Restaurant",
    description:
      "Golden-hour lighting, hand-thrown ceramics, and a short seasonal menu cooked over fire.",
    alternates: { canonical: "/restaurant" },
    openGraph: {
      title: `The Restaurant — ${settings.name}`,
      description:
        "Golden-hour lighting, hand-thrown ceramics, and a short seasonal menu cooked over fire.",
      url: "/restaurant",
      images: [
        {
          url: venue.heroPhoto.src,
          width: 1200,
          height: 800,
          alt: venue.heroPhoto.alt,
        },
      ],
    },
  };
}

export const dynamic = "force-dynamic";

const WINES = [
  { name: "Skin-contact Rhône white", note: "For the octopus — saline, apricot" },
  { name: "Old-vine Grenache", note: "For the lamb — dark cherry, woodsmoke" },
  { name: "Vintage Bual Madeira", note: "For the chocolate tart — burnt caramel" },
];

export default async function RestaurantWorldPage() {
  const [items, settings] = await Promise.all([
    getVenueItems(venue.featuredIds),
    getSiteSettings(),
  ]);

  return (
    <>
      <VideoJsonLd
        name={`A ${settings.name} pizza, assembled over fire`}
        description="San Marzano sauce, hand-torn mozzarella, and ninety seconds in the wood fire — one pie built in eight seconds of stop-motion film."
        contentUrl="/restaurant-film.mp4"
        thumbnailUrl="/restaurant-film-poster.jpg"
        duration="PT8S"
      />

      {/* The page IS the film: an 8-second stop-motion pizza assembly,
          scrubbed by scroll. Sauce → mozzarella → fire, beat-matched to the
          gaps between content panels below. */}
      <ScrollFilm
        src="/restaurant-film.mp4"
        poster="/restaurant-film-poster.jpg"
        backdrop="bg-gradient-to-b from-[#241811] via-[#181210] to-[#100c0a]"
      />

      <main className="relative z-10 text-linen">
        {/* 1 — Hero: establishing shot, camera high over the table */}
        <WorldHero dark venue={venue} siteName={settings.name}>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
            {settings.name} — {venue.tagline}
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
              className="btn-ticket rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Book the Dining Room
              <span aria-hidden className="ticket-stub">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
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

        {/* 3 — Film beat: San Marzano sauce swirled across the dough */}
        <GapCaption dark scene="01" eyebrow="First, the sauce" title="San Marzano, swirled by hand — keep scrolling" />
        <WorldGap h="h-[95vh]" />

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
                    {item.photo_url && (
                      <Image
                        src={item.photo_url}
                        alt={item.photo_alt ?? item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg text-linen">{item.name}</h3>
                      <span className="shrink-0 font-body text-sm font-semibold text-saffron">
                        {formatMoney(item.base_price)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-linen/60">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </WorldSection>

        {/* 6 — Film beat: torn mozzarella and basil land on the pie */}
        <GapCaption dark scene="02" eyebrow="Then, the mozzarella" title="Torn by hand, never sliced — basil last" />
        <WorldGap h="h-[85vh]" />

        <WorldSection ariaLabel="From the chef" tone="dark">
          <blockquote className="mx-auto max-w-2xl text-center">
            <p className="text-balance font-display text-2xl italic leading-relaxed text-linen sm:text-3xl">
              “A dish is ready when there is nothing left to take away. We
              cook slowly so that you can eat slowly.”
            </p>
            <footer className="mt-6 font-body text-xs uppercase tracking-[0.3em] text-saffron">
              — The Kitchen at {settings.name}
            </footer>
          </blockquote>
        </WorldSection>

        {/* 7 — Film beat: cold-pressed oil, steam, the fire behind */}
        <GapCaption dark scene="03" eyebrow="The finish" title="Cold-pressed oil, wood fire, sixty seconds" />
        <WorldGap h="h-[85vh]" />

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

        {/* 8 — Gallery, FAQ, floating like the sections above */}
        <div className="px-4 py-8 sm:px-6">
          <div className="glass-dark mx-auto max-w-6xl rounded-[2.5rem]">
            <VenueGalleryBand
              venue={venue}
              tone="dark"
              title="The room at golden hour"
              accentClass="text-saffron"
            />
            <VenueFAQ venue={venue} tone="dark" accentClass="text-saffron" />
          </div>
        </div>

        {/* 9 — Film beat: the fired pie, full frame, nothing over it */}
        <GapCaption dark scene="04" eyebrow="Out of the fire" title="Ninety seconds, blistered and done" />
        <WorldGap h="h-[90vh]" />

        {/* 10 — Hours + closing CTA */}
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
          siteName={settings.name}
          title="Tonight deserves a better table"
          subtitle="Walk-ins welcome, but the fire seats go fast. Book ahead and we'll have the bread warm when you arrive."
          primaryLabel="Reserve a Table"
        />
      </main>
    </>
  );
}
