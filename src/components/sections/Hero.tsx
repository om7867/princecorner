"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useMediaCapability } from "@/lib/use-media-capability";
import { useSectionProgress } from "@/lib/use-section-progress";
import { HeroScene } from "@/components/scenes/HeroScene";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const capability = useMediaCapability();
  const [sceneLoaded, setSceneLoaded] = useState(false);

  const show3D = capability.ready && capability.canRender3D;
  const handleSceneReady = useCallback(() => setSceneLoaded(true), []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Welcome to Smaplee"
      className="relative h-[170vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-gradient-to-b from-[#3d2a1a] via-[#2e1e12] to-[#221b15]">
        {/* Always-present gradient base: fast LCP, and the full experience for
            reduced-motion / non-WebGL visitors. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,_rgba(231,167,58,0.18),_transparent_60%)]"
        />

        {show3D && (
          <div
            className="absolute inset-0 transition-opacity duration-1000 ease-[var(--ease-cubic)]"
            style={{ opacity: sceneLoaded ? 1 : 0 }}
          >
            <HeroScene
              progress={progress}
              reducedMotion={capability.reducedMotion}
            />
            {/* Fires once the Canvas has mounted a frame — good enough proxy
                for "asset stream has started" without wiring loader events. */}
            <SceneReadySignal onReady={handleSceneReady} />
          </div>
        )}

        {/* Scrim: guarantees WCAG-AA text contrast over the 3D scene no
            matter how the dish is framed at a given viewport/scroll state. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-[5] h-[70%] bg-gradient-to-b from-espresso/70 via-espresso/25 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-[5] h-[22%] bg-gradient-to-t from-espresso/80 to-transparent"
        />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-start px-6 pt-[16vh] text-center sm:pt-[18vh]">
          <p
            className="motion-safe:animate-[fade-rise_0.9s_var(--ease-cubic)_backwards] font-body text-xs uppercase tracking-[0.35em] text-saffron"
            style={{ animationDelay: "150ms" }}
          >
            Est. in a small kitchen, grown by word of mouth
          </p>
          <h1
            className="motion-safe:animate-[fade-rise_1s_var(--ease-cubic)_backwards] mt-5 text-balance font-display text-5xl italic text-linen sm:text-7xl"
            style={{ animationDelay: "320ms" }}
          >
            Welcome to Smaplee
          </h1>
          <p
            className="motion-safe:animate-[fade-rise_1s_var(--ease-cubic)_backwards] mt-6 max-w-md text-balance text-base text-linen/80 sm:text-lg"
            style={{ animationDelay: "520ms" }}
          >
            Slow-roasted, hand-poured, and served at our table — come taste
            what patience and good company make.
          </p>

          <div
            className="motion-safe:animate-[fade-rise_1s_var(--ease-cubic)_backwards] mt-10 flex flex-col items-center gap-3 sm:flex-row"
            style={{ animationDelay: "720ms" }}
          >
            <a
              href="#reservation"
              className="rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 hover:shadow-lg hover:shadow-saffron/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Reserve a Table
            </a>
            <a
              href="#menu"
              className="rounded-full border border-linen/30 px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-colors duration-300 ease-[var(--ease-cubic)] hover:border-linen/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linen"
            >
              Explore the Menu
            </a>
          </div>
        </div>

        <a
          href="#menu"
          aria-label="Scroll to explore"
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-linen/70 transition-colors hover:text-linen"
        >
          <span className="font-body text-[11px] uppercase tracking-[0.3em]">
            Scroll to explore
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="motion-safe:animate-bounce"
          >
            <path
              d="M2 5L8 11L14 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

function SceneReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const id = requestAnimationFrame(() => onReady());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}
