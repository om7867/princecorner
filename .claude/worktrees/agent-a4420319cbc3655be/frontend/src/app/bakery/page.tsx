import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getVenue, BAKERY_SCHEDULE, BAKERY_BREADS } from "@/data/venues";
import { getVenueItems } from "@/lib/venue-items";
import { getSiteSettings } from "@/lib/site-settings";
import { formatMoney } from "@/lib/types";
import { WorldCanvas } from "@/scenes/core/WorldCanvas";
import { BakeryWorld, BAKERY_KEYFRAMES } from "@/scenes/worlds/BakeryWorld";
import {
  WorldHero,
  WorldSection,
  WorldGap,
  GapCaption,
} from "@/components/worlds/shared";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "@/components/venues/shared";
import { PageUnavailable } from "@/components/ui/PageUnavailable";

const venue = getVenue("bakery")!;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "The Bakery",
    description:
      "Levain fed by hand, crusts that crackle, shelves that empty by noon. Baked every morning.",
    alternates: { canonical: "/bakery" },
    openGraph: {
      title: `The Bakery — ${settings.name}`,
      description:
        "Levain fed by hand, crusts that crackle, shelves that empty by noon. Baked every morning.",
      url: "/bakery",
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

export default async function BakeryWorldPage() {
  const [items, settings] = await Promise.all([
    getVenueItems(venue.featuredIds),
    getSiteSettings({ fresh: true }),
  ]);

  if (settings.hidden_pages.includes("bakery")) {
    return <PageUnavailable siteName={settings.name} />;
  }

  return (
    <>
      <WorldCanvas
        keyframes={BAKERY_KEYFRAMES}
        backdrop="bg-gradient-to-b from-[#eddcc0] via-[#e8d3ae] to-[#dfc79e]"
      >
        <BakeryWorld />
      </WorldCanvas>

      <main className="relative z-10 text-charcoal">
        {/* 1 — Hero: floating over the flour-dusted counter */}
        <WorldHero dark={false} venue={venue} siteName={settings.name}>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
            {settings.name} — {venue.tagline}
          </p>
          <h1 className="mt-5 text-balance font-display text-5xl italic text-espresso sm:text-7xl">
            Baked every morning
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-balance text-base text-espresso/80 sm:text-lg lg:mx-0">
            {venue.intro}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/order?table=T1"
              className="btn-ticket rounded-full bg-espresso px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
            >
              Order for Pickup
              <span aria-hidden className="ticket-stub">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
            <Link
              href="#breads"
              className="rounded-full border border-espresso/25 px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-colors duration-300 hover:border-espresso/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
            >
              What&apos;s Fresh Today
            </Link>
          </div>
        </WorldHero>

        {/* 2 — Camera drifts along the day's bake */}
        <GapCaption dark={false} scene="01" eyebrow="Today's bake" title="Out of the deck oven since 6:30" />
        <WorldGap h="h-[85vh]" />

        {/* 3 — Oven clock timeline */}
        <WorldSection ariaLabel="Daily bake schedule" tone="light">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
                By the Oven Clock
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-espresso sm:text-5xl">
                A day at the bakery
              </h2>
            </div>
            <ol className="mt-14" role="list">
              {BAKERY_SCHEDULE.map((slot, i) => (
                <li
                  key={slot.time}
                  className={`flex items-baseline gap-6 py-6 sm:gap-10 ${i > 0 ? "border-t border-espresso/10" : ""}`}
                >
                  <span className="w-16 shrink-0 text-right font-display text-2xl italic text-terracotta">
                    {slot.time}
                  </span>
                  <p className="text-espresso/80">{slot.event}</p>
                </li>
              ))}
            </ol>
          </div>
        </WorldSection>

        {/* 4 — Bread lineup */}
        <WorldSection id="breads" ariaLabel="The bread lineup" tone="light">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
                The Lineup
              </p>
              <h2 className="mt-4 font-display text-4xl italic text-espresso">
                What&apos;s on the shelf
              </h2>
              <p className="mx-auto mt-4 max-w-md text-espresso/70">
                Reserve a loaf by 4pm the day before and we&apos;ll hold it
                past the noon rush.
              </p>
            </div>
            <ul className="mt-12" role="list">
              {BAKERY_BREADS.map((bread, i) => (
                <li
                  key={bread.name}
                  className={`flex items-baseline gap-4 py-5 ${i > 0 ? "border-t border-dashed border-espresso/20" : ""}`}
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
        </WorldSection>

        {/* 5 — Camera peers into the oven mouth */}
        <GapCaption dark={false} scene="02" eyebrow="Behind the oven" title="The levain is older than the bakery" />
        <WorldGap h="h-[75vh]" />

        <WorldSection ariaLabel="Behind the oven" tone="light">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              Behind the Oven
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-espresso">
              Flour, water, salt, patience
            </h2>
            <p className="mt-6 text-espresso/70">
              Our starter was fed for the first time in 2019 and hasn&apos;t
              missed a day since. Every loaf ferments for three days, is
              shaped by hand at five in the morning, and hits the shelf still
              ticking with oven heat. There is no shortcut in this room.
            </p>
          </div>
        </WorldSection>

        {/* 6 — Sweet counter */}
        <WorldSection ariaLabel="Sweet counter" tone="light">
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
                  className="group overflow-hidden rounded-3xl border border-espresso/10 bg-[#f8f1e4]/95 transition-transform duration-500 ease-[var(--ease-cubic)] hover:-translate-y-1 hover:shadow-xl hover:shadow-espresso/10"
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
                      <h3 className="font-display text-lg text-espresso">{item.name}</h3>
                      <span className="shrink-0 font-body text-sm font-semibold text-terracotta">
                        {formatMoney(item.base_price)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-espresso/70">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </WorldSection>

        {/* 7 — Custom cakes */}
        <WorldSection ariaLabel="Custom cakes" tone="light">
          <div className="mx-auto max-w-2xl rounded-3xl border border-terracotta/20 bg-[#f8f1e4]/95 p-10 text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              Custom Cakes
            </p>
            <h2 className="mt-4 font-display text-3xl italic text-espresso">
              For the days worth a candle
            </h2>
            <p className="mx-auto mt-4 max-w-md text-espresso/70">
              Birthdays, weddings, or a Tuesday that needs rescuing — tiered
              or single, filled and finished to order. Give us five days&apos;
              notice and we&apos;ll give you the centerpiece.
            </p>
            <Link
              href="/reserve"
              className="mt-7 inline-block rounded-full bg-espresso px-8 py-3 font-body text-sm font-semibold text-linen transition-transform duration-300 hover:scale-105"
            >
              Start a Cake Enquiry
            </Link>
          </div>
        </WorldSection>

        {/* 8 — Gallery + FAQ + CTA */}
        <div className="bg-[#f2e7d3]/90 backdrop-blur-md">
          <VenueGalleryBand
            venue={venue}
            tone="light"
            eyebrow="Flour Everywhere"
            title="Crust, crumb, and quiet pride"
            accentClass="text-terracotta"
          />
          <VenueFAQ venue={venue} tone="light" accentClass="text-terracotta" />
        </div>

        <VenueCTABanner
          venue={venue}
          siteName={settings.name}
          title="Set your alarm — it sells out"
          subtitle="Most days the shelves are bare by noon. Order ahead and we'll hold yours past the rush."
          primaryLabel="Order for Pickup"
        />
      </main>
    </>
  );
}
