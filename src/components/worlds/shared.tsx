import type { ReactNode } from "react";
import type { Venue } from "@/data/venues";
import { Reveal } from "@/components/ui/Reveal";

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
  // A floating glass card, not a full-bleed bar: the film stays in view down
  // both margins and in the breathing room between panels, so the page never
  // fully covers the footage it's scrubbing. Content rises into place as the
  // card enters the viewport.
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative px-4 py-8 sm:px-6 ${className}`}
    >
      <div
        className={`frame-card mx-auto max-w-6xl rounded-[2.5rem] px-6 py-20 sm:px-12 ${
          tone === "dark" ? "glass-dark" : "glass-light"
        }`}
      >
        <Reveal>{children}</Reveal>
      </div>
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
        <div className="text-center motion-safe:animate-[fade-rise_0.9s_var(--ease-out-expo)_both] lg:text-left">
          {children}
          <QuickInfo venue={venue} dark={dark} />
        </div>
        {/* right half deliberately empty — the film's hero subject lives here */}
        <div aria-hidden className="hidden lg:block" />
      </div>
      <div
        aria-hidden
        className={`absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 motion-safe:animate-[fade-rise_0.9s_var(--ease-out-expo)_0.5s_both] ${cue}`}
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em]">
          Scroll
        </span>
        <span className="relative block h-9 w-px overflow-hidden bg-current/25">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-current motion-safe:animate-[cue-drop_1.8s_var(--ease-cubic)_infinite]" />
        </span>
      </div>
    </section>
  );
}

/**
 * Clapper slate floated over a camera-move Gap: striped clap bar, scene
 * numeral, a live REC dot — the page names its own footage like a take.
 */
export function GapCaption({
  dark,
  eyebrow,
  title,
  scene,
}: {
  dark: boolean;
  eyebrow: string;
  title: string;
  /** Chapter numeral shown as a ghost figure beside the slate, e.g. "02". */
  scene?: string;
}) {
  return (
    <div className="pointer-events-none relative z-10 mx-auto -mb-[55vh] flex h-[55vh] max-w-6xl items-end px-6 pb-10">
      <Reveal>
        <div className="flex items-end gap-4">
          {scene && (
            <span
              aria-hidden
              className={`select-none font-display text-7xl italic leading-[0.8] ${
                dark ? "text-linen/30" : "text-espresso/25"
              }`}
            >
              {scene}
            </span>
          )}
          <div
            className={`overflow-hidden rounded-2xl ${
              dark ? "glass-dark" : "glass-light"
            }`}
          >
            <div
              aria-hidden
              className="h-2 w-full opacity-90"
              style={{
                background: `repeating-linear-gradient(-45deg, ${
                  dark ? "var(--color-saffron)" : "var(--color-terracotta)"
                } 0 9px, transparent 9px 18px)`,
              }}
            />
            <div className="px-6 py-4">
              <p
                className={`flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.3em] ${
                  dark ? "text-saffron" : "text-terracotta"
                }`}
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-terracotta motion-safe:animate-pulse"
                />
                {scene ? `Scene ${scene} — ${eyebrow}` : eyebrow}
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
        </div>
      </Reveal>
    </div>
  );
}
