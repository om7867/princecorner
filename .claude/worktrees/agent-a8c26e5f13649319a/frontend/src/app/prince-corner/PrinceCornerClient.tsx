"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CrownIcon } from "@/components/ui/CrownIcon";
import { Reveal } from "@/components/ui/Reveal";

const FOOD_PHOTOS = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { src: `/food-photos/food_${n}.jpg`, alt: `Signature plate from Prince Corner, no. ${i + 1}` };
});

const MENU_PHOTOS = Array.from({ length: 17 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { src: `/menu-photos/menu_${n}.jpg`, alt: `Prince Corner menu card, page ${i + 1}` };
});

const HIGHLIGHTS = [
  "100% Pure Veg",
  "Dosa • Punjabi • Chinese",
  "Street-Food Favourites",
  "Fresh Off The Tawa",
];

function telLink(phone: string | null): string {
  return `tel:${(phone ?? "").replace(/[^+\d]/g, "")}`;
}

function waLink(whatsapp: string | null): string {
  return `https://wa.me/${whatsapp ?? ""}?text=${encodeURIComponent("Hi! I'd like to know more about Prince Corner.")}`;
}

export function PrinceCornerClient({ phone, whatsapp }: { phone: string | null; whatsapp: string | null }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + MENU_PHOTOS.length) % MENU_PHOTOS.length)),
    []
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % MENU_PHOTOS.length)),
    []
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <div className="min-h-screen bg-prince-red-deep font-body text-prince-cream selection:bg-prince-red selection:text-white">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/food-photos/storefront_hero.jpg"
            alt="Prince Corner storefront lit up at night"
            fill
            priority
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-prince-red-deep/70 via-prince-red-deep/80 to-prince-red-deep" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(74,8,18,0.9)_100%)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <Reveal>
            <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-prince-cream/70 bg-prince-red shadow-lg shadow-black/40">
              <CrownIcon className="h-8 w-8 text-white" />
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display text-[16vw] italic leading-[0.85] tracking-tight text-white sm:text-8xl lg:text-9xl">
              Prince
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-3 font-body text-xs font-semibold uppercase tracking-[0.55em] text-prince-cream/80 sm:text-sm">
              Isanpurwala
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-10 font-display text-3xl italic text-white sm:text-5xl">
              Open up your happiness!
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#menu"
                className="rounded-full bg-white px-8 py-3 font-body text-sm font-semibold text-prince-red transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105"
              >
                See the Menu
              </a>
              <a
                href={waLink(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-prince-cream/50 px-8 py-3 font-body text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
              >
                WhatsApp Us
              </a>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 h-14 w-[1px] -translate-x-1/2 overflow-hidden bg-prince-cream/25">
          <span className="absolute left-0 top-0 h-4 w-full bg-white motion-safe:animate-[cue-drop_2.2s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* ── HIGHLIGHTS BAND ──────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-prince-red py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6">
          {HIGHLIGHTS.map((h) => (
            <span key={h} className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
              {h}
            </span>
          ))}
        </div>
      </section>

      {/* ── SIGNATURE DISHES ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <div className="mb-16 flex flex-col items-center text-center">
            <p className="mb-4 font-body text-xs uppercase tracking-[0.4em] text-prince-red">
              Signature Plates
            </p>
            <h2 className="font-display text-4xl italic text-white sm:text-6xl">Straight From The Counter</h2>
          </div>
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {FOOD_PHOTOS.slice(0, 12).map((photo) => (
              <div
                key={photo.src}
                className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-transparent transition-colors duration-500 hover:border-prince-red"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── FOOD MARQUEE ─────────────────────────────────────────────── */}
      <section className="overflow-hidden border-y border-white/10 bg-black/20 py-10">
        <div className="flex w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex w-max animate-marquee-images gap-6 px-3" aria-hidden={dup === 1}>
              {FOOD_PHOTOS.slice(12).map((photo) => (
                <div key={`${dup}-${photo.src}`} className="relative h-56 w-56 shrink-0 overflow-hidden rounded-2xl opacity-80 transition-opacity duration-700 hover:opacity-100 sm:h-64 sm:w-64">
                  <Image src={photo.src} alt={photo.alt} fill sizes="256px" className="object-cover" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── MENU ─────────────────────────────────────────────────────── */}
      <section id="menu" className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <div className="mb-16 flex flex-col items-center text-center">
            <p className="mb-4 font-body text-xs uppercase tracking-[0.4em] text-prince-red">
              The Full Menu
            </p>
            <h2 className="font-display text-4xl italic text-white sm:text-6xl">Every Page, Every Price</h2>
            <p className="mt-6 max-w-xl font-body text-sm text-prince-cream/70">
              Tap any page to read it full-screen — soups, starters, salads, the dosa counter and more, exactly as it hangs on the wall.
            </p>
          </div>
        </Reveal>
        <Reveal stagger>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {MENU_PHOTOS.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Open ${photo.alt}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-white/10 bg-white transition-colors duration-300 hover:border-prince-red"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center font-body text-[10px] font-semibold uppercase tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Page {i + 1}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── STORY / CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 py-32">
        <div className="absolute inset-0 z-0">
          <Image src="/food-photos/storefront_hero.jpg" alt="" fill className="object-cover opacity-20" aria-hidden />
          <div className="absolute inset-0 bg-prince-red-deep/90" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <Reveal>
            <CrownIcon className="mb-8 h-10 w-10 text-prince-red" />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display text-4xl italic text-white sm:text-6xl">Open up your happiness!</h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 font-body text-sm leading-relaxed text-prince-cream/70">
              Swing by the corner for the full spread, or reach out below — we're happy to help you plan an order.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={telLink(phone)}
                className="rounded-full bg-prince-red px-8 py-3 font-body text-sm font-semibold text-white transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105"
              >
                Call Us
              </a>
              <a
                href={waLink(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-prince-cream/50 px-8 py-3 font-body text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
              >
                WhatsApp Us
              </a>
              <Link
                href="/"
                className="rounded-full px-8 py-3 font-body text-sm font-semibold text-prince-cream/70 underline underline-offset-4 transition-colors duration-300 hover:text-white"
              >
                Back to Home
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu card viewer"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 px-4 py-8 motion-safe:animate-[fade-rise_0.3s_var(--ease-out-expo)_both]"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative flex h-full w-full max-w-lg items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous page"
              className="absolute left-0 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:-translate-x-full"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="relative h-full max-h-[80vh] w-full overflow-hidden rounded-xl bg-white">
              <Image
                src={MENU_PHOTOS[lightboxIndex].src}
                alt={MENU_PHOTOS[lightboxIndex].alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next page"
              className="absolute right-0 z-10 flex h-11 w-11 translate-x-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:translate-x-full"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M7 3l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <p className="mt-4 font-body text-xs uppercase tracking-[0.3em] text-white/60">
            Page {lightboxIndex + 1} of {MENU_PHOTOS.length}
          </p>
        </div>
      )}
    </div>
  );
}
