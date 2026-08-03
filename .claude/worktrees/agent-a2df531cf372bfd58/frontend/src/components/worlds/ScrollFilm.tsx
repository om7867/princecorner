"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaCapability } from "@/lib/use-media-capability";
import { usePageScrollProgress } from "@/scenes/core/use-page-scroll";

/**
 * A fixed full-viewport film scrubbed by page scroll — the video's timeline
 * IS the page's scroll timeline. Built for stop-motion footage, where
 * frame-stepping under the reader's thumb feels intentional rather than
 * janky: scrolling literally performs the assembly.
 *
 * Same layer contract as WorldCanvas (fixed inset-0 z-0, DOM scrolls above),
 * so world pages can swap a WebGL scene for footage without relayout.
 */
export function ScrollFilm({
  src,
  poster,
  backdrop,
  tone = "dark",
}: {
  src: string;
  poster: string;
  /** Tailwind gradient classes painting the base atmosphere under the film. */
  backdrop: string;
  /** Which page chrome the footage must melt into at the frame edges. */
  tone?: "dark" | "light";
}) {
  const capability = useMediaCapability();
  const progress = usePageScrollProgress();
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Server-rendered <video> can fire "loadeddata" before hydration attaches
  // the handler on fast connections — check readyState on mount too.
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      setVideoReady(true);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !capability.ready) return;

    if (capability.reducedMotion) {
      video.currentTime = 0;
      return;
    }

    let raf = 0;
    let smoothed = -1;
    let lastWritten = -1;
    let lastTick = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(0.1, (now - lastTick) / 1000);
      lastTick = now;

      if (video.readyState >= 1 && video.duration) {
        // Run ~10% ahead of raw scroll so the final frame lands during the
        // last open gap — not underneath the closing CTA at page bottom.
        const target = Math.min(1, progress.current * 1.1);
        // Damped pursuit instead of raw mapping: scroll flicks land softly,
        // like a camera operator settling on the mark.
        smoothed =
          smoothed < 0
            ? target
            : smoothed + (target - smoothed) * Math.min(1, delta * 6);

        // Only write when the previous seek has resolved AND we've moved at
        // least ~half a source frame — queueing seeks on top of an in-flight
        // one is what reads as stutter, and redundant currentTime writes
        // force wasteful re-seeks.
        if (
          !video.seeking &&
          Math.abs(smoothed - lastWritten) > 0.02 / video.duration
        ) {
          lastWritten = smoothed;
          video.currentTime = smoothed * video.duration;
        }

        // Slow push-in as the film plays: depth without a second camera.
        video.style.transform = `scale(${1.06 + smoothed * 0.08})`;

        // The hairline under the navbar is the film's timecode — how much
        // of the story the reader has scrolled through.
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${smoothed})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, capability.ready, capability.reducedMotion]);

  return (
    <>
      <div
        ref={barRef}
        aria-hidden
        className="fixed inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-saffron to-terracotta"
      />
    <div aria-hidden className={`fixed inset-0 z-0 overflow-hidden ${backdrop}`}>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster={poster}
        onLoadedData={() => setVideoReady(true)}
        className="h-full w-full object-cover transition-opacity duration-1000 ease-[var(--ease-cubic)]"
        style={{ opacity: videoReady ? 1 : 0, transform: "scale(1.06)" }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Filmic finishing: vignette pulls the eye center-frame, and the
          edge fades blend the footage into the page's chrome — espresso for
          dark worlds, warm linen for the sunlit ones. */}
      {tone === "dark" ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(16,12,10,0.55)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-[#100c0a]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-[#100c0a]/80 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(58,42,30,0.3)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-[#f5eee3]/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-[#f5eee3]/75 to-transparent" />
        </>
      )}

      {/* Projected, not embedded: living grain over the whole print. */}
      <div aria-hidden className="film-grain" />
    </div>
    </>
  );
}
