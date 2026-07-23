"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { VENUES } from "@/data/venues";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function VenueGrid({ hiddenPages = [] }: { hiddenPages?: string[] }) {
  const containerRef = useRef<HTMLElement>(null);
  const venues = VENUES.filter((v) => !hiddenPages.includes(v.slug));

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".venue-stack-card") as HTMLElement[];
      const mm = gsap.matchMedia();

      // Desktop: Stacking Cards with Pinning
      mm.add("(min-width: 1024px)", () => {
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return; // Don't animate the last card out
          
          gsap.to(card, {
            scale: 0.9,
            opacity: 0,
            scrollTrigger: {
              trigger: card,
              start: "top top+=100", // Start pinning slightly below top
              end: "bottom top",
              pin: true,
              pinSpacing: false,
              scrub: true,
            }
          });
        });
      });
      // (No GSAP needed for mobile; pure CSS snap scrolling is used)
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="spaces"
      ref={containerRef}
      aria-label="Our spaces"
      className="bg-linen-soft py-24 sm:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-5xl px-6 mb-16 lg:mb-24 text-center">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
          Four Rooms, One Table
        </p>
        <h2 className="mt-4 font-display text-4xl italic text-espresso sm:text-6xl">
          Explore our spaces
        </h2>
      </div>

      {/* MOBILE: Horizontal Swipe Carousel */}
      <div className="lg:hidden w-full relative">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 pb-12 no-scrollbar">
          {venues.map((venue, index) => (
            <div 
              key={venue.slug} 
              className="snap-center shrink-0 relative h-[60vh] min-h-[450px] w-[85vw] max-w-sm shadow-2xl rounded-3xl overflow-hidden bg-espresso active:scale-[0.98] transition-transform duration-300"
            >
              <Link href={`/${venue.slug}`} className="block h-full w-full">
                <Image
                  src={venue.heroPhoto.src}
                  alt={venue.heroPhoto.alt}
                  fill
                  sizes="85vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-transparent opacity-90" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-8 pb-12">
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-saffron mb-3 opacity-90 border border-saffron/30 rounded-full px-3 py-1 backdrop-blur-sm bg-black/20">
                    0{index + 1}
                  </span>
                  <h3 className="font-display text-3xl italic text-linen">
                    {venue.name}
                  </h3>
                  <p className="mt-3 text-sm text-linen/80 font-body line-clamp-3">
                    {venue.tagline}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP: Cinematic Stacking Cards */}
      <div className="hidden lg:block mx-auto max-w-4xl px-6 relative">
        {VENUES.map((venue, index) => (
          <div 
            key={venue.slug} 
            className="venue-stack-card w-full mb-32 shadow-2xl rounded-[2rem] overflow-hidden bg-espresso"
            style={{ zIndex: index + 1 }}
          >
            <Link href={`/${venue.slug}`} className="group block relative aspect-[4/3] md:aspect-video w-full">
              <Image
                src={venue.heroPhoto.src}
                alt={venue.heroPhoto.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover transition-transform duration-1000 ease-[var(--ease-cubic)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/20 to-transparent opacity-80" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 transition-transform duration-700">
                <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-saffron mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  Step Inside
                </span>
                <h3 className="font-display text-4xl italic text-linen md:text-6xl">
                  {venue.name}
                </h3>
                <p className="mt-6 max-w-md text-base text-linen/70 font-body">
                  {venue.tagline}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
