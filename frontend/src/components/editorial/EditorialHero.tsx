"use client";

import Image from "next/image";
import Link from "next/link";
import { useLuxuryReveal } from "@/hooks/useLuxuryReveal";

export function EditorialHero({ siteName }: { siteName: string }) {
  const containerRef = useLuxuryReveal();
  const displayName = siteName && siteName !== "kelviontech" ? siteName : "Prince Corner";

  return (
    <section 
      ref={containerRef as any}
      className="relative flex min-h-screen w-full flex-col justify-end bg-[#0e0b08] px-6 pb-16 pt-48 sm:pt-52 lg:pt-60 lg:px-16"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0e0b08]">
        <div className="relative h-full w-full">
          <Image
            src="/food-photos/storefront_hero.jpg"
            alt={`${displayName} Authentic Restaurant Experience`}
            fill
            className="object-cover opacity-65 scale-105 transition-transform duration-[20000ms] ease-out hover:scale-110"
            priority
            sizes="100vw"
          />
          {/* Deep ambient red-to-amber vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08] via-[#0e0b08]/60 to-[#b71c1c]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0b08] via-[#0e0b08]/50 to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        {/* Badges */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-saffron/40 bg-saffron/10 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.25em] text-saffron backdrop-blur-md shadow-[0_0_15px_rgba(231,167,58,0.2)]">
            🌱 100% Pure Vegetarian
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-body text-xs font-medium uppercase tracking-[0.2em] text-linen/80 backdrop-blur-md">
            Ahmedabad&apos;s Favourite Taste
          </span>
        </div>

        <h1 className="luxury-heading font-display text-3xl sm:text-6xl lg:text-[6.5rem] leading-[1.08] text-white font-bold drop-shadow-2xl">
          Serving Ahmedabad&apos;s <br />
          <span className="italic font-normal text-saffron">Favourite Taste.</span>
        </h1>

        <p className="luxury-paragraph mt-4 sm:mt-6 max-w-xl font-body text-sm sm:text-lg leading-relaxed text-linen/90 font-light">
          A steaming bowl. Melting butter. Recipes unchanged since our very first tawa. Experience Gujarat&apos;s iconic street food, crisp dosas, and slow-simmered Punjabi gravies.
        </p>

        {/* Dual Conversion CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Link
            href="/order?table=ONLINE&r=prince-corner-isanpur"
            className="group relative flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-saffron to-amber-500 px-6 sm:px-8 py-3.5 sm:py-4 font-body text-xs sm:text-sm font-extrabold uppercase tracking-[0.15em] text-espresso shadow-[0_10px_30px_rgba(231,167,58,0.4)] transition-all active:scale-95"
          >
            <span>Order Online Now</span>
            <span className="transition-transform group-hover:translate-x-1">➔</span>
          </Link>

          <Link
            href="/#menu"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 sm:px-8 py-3.5 sm:py-4 font-body text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-linen backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
          >
            <span>Explore Menu 🍲</span>
          </Link>
        </div>

        {/* Social Proof & Branches */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-white/10 pt-6 text-[11px] sm:text-xs font-body text-linen/60">
          <div className="flex items-center gap-2">
            <span className="text-saffron font-bold text-sm">★ 4.5</span>
            <span>Based on 2,500+ Reviews</span>
          </div>
          <span className="hidden sm:inline text-white/20">•</span>
          <div>
            <span className="text-linen font-semibold">📍 11 Outlets Across Ahmedabad:</span> Isanpur · Maninagar · Satellite · Vastrapur · Bopal · Nikol · Gota
          </div>
        </div>
      </div>
    </section>
  );
}

