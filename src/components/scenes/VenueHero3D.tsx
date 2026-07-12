"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { useMediaCapability } from "@/lib/use-media-capability";
import { useSectionProgress } from "@/lib/use-section-progress";
import { PhotoDishScene } from "@/components/scenes/PhotoDishScene";
import type { Venue } from "@/data/venues";

export type VenueHeroTheme = {
  /** Tailwind gradient classes for the sticky backdrop. */
  gradient: string;
  /** Dark pages use espresso scrims + linen text; light pages the inverse. */
  dark: boolean;
  /** Hero photo layer opacity, tuned per theme so text always wins. */
  photoOpacity: string;
};

/**
 * Split-screen scroll hero (restaurant-site best practice): copy, CTAs and
 * the above-the-fold essentials (hours / address / phone) on the left, the
 * venue's signature dish floating as a 3D card on the right, spinning a
 * full turn over the scroll range.
 */
export function VenueHero3D({
  venue,
  theme,
  signaturePhoto,
  children,
}: {
  venue: Venue;
  theme: VenueHeroTheme;
  /** Live from the store — the venue's first available signature dish. */
  signaturePhoto: string | null;
  children: ReactNode;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(heroRef);
  const capability = useMediaCapability();
  const show3D = capability.ready && capability.canRender3D;
  const signature = signaturePhoto ?? venue.heroPhoto.src;

  const scrimSide = theme.dark
    ? "from-espresso/90 via-espresso/55 to-espresso/15"
    : "from-linen/95 via-linen/60 to-linen/15";
  const scrimBottom = theme.dark ? "from-espresso/80" : "from-linen/85";
  const infoText = theme.dark ? "text-linen/75" : "text-espresso/75";
  const infoBorder = theme.dark ? "border-linen/20" : "border-espresso/15";
  const cueText = theme.dark ? "text-linen/60" : "text-espresso/50";

  return (
    <section
      ref={heroRef}
      aria-label={`${venue.name} at Smaplee`}
      className="relative h-[200vh]"
    >
      <div
        className={`sticky top-0 h-screen w-full overflow-hidden bg-gradient-to-b ${theme.gradient}`}
      >
        <div aria-hidden className="absolute inset-0">
          <Image
            src={venue.heroPhoto.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className={`object-cover ${theme.photoOpacity}`}
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 72% 60%, ${venue.accent}30, transparent 55%)`,
          }}
        />
        {/* side scrim keeps the left copy column readable over the photo */}
        <div
          aria-hidden
          className={`absolute inset-0 bg-gradient-to-r ${scrimSide}`}
        />
        <div
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t ${scrimBottom} to-transparent`}
        />

        <div className="relative z-10 mx-auto grid h-full max-w-7xl items-center gap-4 px-6 pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Copy column */}
          <div className="text-center lg:text-left">
            {children}

            {/* Above-the-fold essentials */}
            <dl
              className={`mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t ${infoBorder} pt-6 text-sm lg:justify-start`}
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={infoText}>
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <dt className="sr-only">Hours</dt>
                <dd className={infoText}>{venue.quickInfo.hours}</dd>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={infoText}>
                  <path d="M7 13s4.5-4 4.5-7.3A4.5 4.5 0 002.5 5.7C2.5 9 7 13 7 13z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="7" cy="5.8" r="1.4" stroke="currentColor" strokeWidth="1.1" />
                </svg>
                <dt className="sr-only">Address</dt>
                <dd className={infoText}>{venue.quickInfo.address}</dd>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={infoText}>
                  <path d="M3 2h2.2l1 2.8-1.4 1.1a8.5 8.5 0 003.3 3.3l1.1-1.4 2.8 1V11a1 1 0 01-1 1A10 10 0 012 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                </svg>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a
                    href={`tel:${venue.quickInfo.phone.replace(/[^+\d]/g, "")}`}
                    className={`${infoText} underline-offset-4 hover:underline`}
                  >
                    {venue.quickInfo.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* 3D dish column */}
          <div className="relative h-[34vh] lg:h-[68vh]" aria-hidden>
            {show3D ? (
              <PhotoDishScene
                url={signature}
                spinProgress={progress}
                reducedMotion={capability.reducedMotion}
              />
            ) : (
              <div className="relative mx-auto h-full max-w-md overflow-hidden rounded-3xl">
                <Image
                  src={signature}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div
          aria-hidden
          className={`absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 ${cueText}`}
        >
          <span className="font-body text-[10px] uppercase tracking-[0.3em]">
            Scroll
          </span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="motion-safe:animate-bounce">
            <path d="M2 5L8 11L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
