import type { ReactNode } from "react";
import type { Venue } from "@/data/venues";

/**
 * Layout grammar for 3D world pages: content panels are translucent scrims
 * floating over the fixed WebGL stage, and Gaps are empty scroll stretches
 * where the camera performs its big moves with nothing covering the scene.
 */

export function WorldGap({ h = "h-[70vh]" }: { h?: string }) {
  return <div aria-hidden className={h} />;
}

export function WorldSection({
  id,
  ariaLabel,
  tone,
  children,
  className = "",
}: {
  id?: string;
  ariaLabel: string;
  tone: "dark" | "light";
  children: ReactNode;
  className?: string;
}) {
  const scrim =
    tone === "dark"
      ? "bg-[#181210]/85 backdrop-blur-md"
      : "bg-linen/90 backdrop-blur-md";
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative px-6 py-24 ${scrim} ${className}`}
    >
      {children}
    </section>
  );
}

/** Above-the-fold essentials row — hours, address, click-to-call. */
export function QuickInfo({
  venue,
  dark,
}: {
  venue: Venue;
  dark: boolean;
}) {
  const text = dark ? "text-linen/75" : "text-espresso/75";
  const border = dark ? "border-linen/20" : "border-espresso/15";
  return (
    <dl
      className={`mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t ${border} pt-6 text-sm lg:justify-start`}
    >
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={text}>
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <dt className="sr-only">Hours</dt>
        <dd className={text}>{venue.quickInfo.hours}</dd>
      </div>
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={text}>
          <path d="M7 13s4.5-4 4.5-7.3A4.5 4.5 0 002.5 5.7C2.5 9 7 13 7 13z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="7" cy="5.8" r="1.4" stroke="currentColor" strokeWidth="1.1" />
        </svg>
        <dt className="sr-only">Address</dt>
        <dd className={text}>{venue.quickInfo.address}</dd>
      </div>
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={text}>
          <path d="M3 2h2.2l1 2.8-1.4 1.1a8.5 8.5 0 003.3 3.3l1.1-1.4 2.8 1V11a1 1 0 01-1 1A10 10 0 012 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
        <dt className="sr-only">Phone</dt>
        <dd>
          <a
            href={`tel:${venue.quickInfo.phone.replace(/[^+\d]/g, "")}`}
            className={`${text} underline-offset-4 hover:underline`}
          >
            {venue.quickInfo.phone}
          </a>
        </dd>
      </div>
    </dl>
  );
}

/**
 * World hero: copy column over the left half, the right half left open so
 * the 3D scene's hero object owns the frame. Scrims guarantee AA contrast.
 */
export function WorldHero({
  dark,
  venue,
  children,
}: {
  dark: boolean;
  venue: Venue;
  children: ReactNode;
}) {
  const scrimSide = dark
    ? "from-espresso/80 via-espresso/40 to-transparent"
    : "from-linen/90 via-linen/55 to-transparent";
  const cue = dark ? "text-linen/60" : "text-espresso/50";
  return (
    <section
      aria-label={`${venue.name} at Smaplee`}
      className="relative flex min-h-screen items-center"
    >
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-r ${scrimSide}`}
      />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-4 px-6 pt-20 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          {children}
          <QuickInfo venue={venue} dark={dark} />
        </div>
        {/* right half deliberately empty — the WebGL hero object lives here */}
        <div aria-hidden className="hidden lg:block" />
      </div>
      <div
        aria-hidden
        className={`absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 ${cue}`}
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em]">
          Scroll
        </span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="motion-safe:animate-bounce">
          <path d="M2 5L8 11L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}

/** Caption chip floated over a camera-move Gap, naming what you're seeing. */
export function GapCaption({
  dark,
  eyebrow,
  title,
}: {
  dark: boolean;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="pointer-events-none relative z-10 mx-auto -mb-[55vh] flex h-[55vh] max-w-6xl items-end px-6 pb-10">
      <div
        className={`rounded-2xl px-6 py-4 backdrop-blur-md ${
          dark ? "bg-espresso/70" : "bg-linen/80"
        }`}
      >
        <p
          className={`font-body text-[11px] uppercase tracking-[0.3em] ${
            dark ? "text-saffron" : "text-terracotta"
          }`}
        >
          {eyebrow}
        </p>
        <p
          className={`mt-1 font-display text-xl italic ${
            dark ? "text-linen" : "text-espresso"
          }`}
        >
          {title}
        </p>
      </div>
    </div>
  );
}
