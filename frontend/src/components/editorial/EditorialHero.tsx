"use client";

import Image from "next/image";
import { useLuxuryReveal } from "@/hooks/useLuxuryReveal";

export function EditorialHero({ siteName }: { siteName: string }) {
  const containerRef = useLuxuryReveal();

  return (
    <section 
      ref={containerRef as any}
      className="relative flex h-screen w-full flex-col justify-end bg-[#0e0b08] px-6 pb-12 pt-32 lg:px-12"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0e0b08]">
        {/* Parallax wrapper made taller than the screen to prevent gaps when translating down */}
        <div className="relative h-[120%] w-full -top-[10%]" data-parallax="0.15">
          <Image
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2070&auto=format&fit=crop"
            alt={`${siteName} Vegetarian Dining Experience`}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0e0b08]/40 to-[#0e0b08]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl">
        <p className="luxury-paragraph mb-6 font-body text-sm uppercase tracking-[0.3em] text-saffron">
          Pure Vegetarian Fine Dining
        </p>
        <h1 className="luxury-heading font-display text-5xl leading-[1.1] text-linen sm:text-7xl lg:text-[7rem]">
          The Art of <br />
          Plant-Based Elegance
        </h1>
        <p className="luxury-paragraph mt-8 max-w-lg font-body text-lg leading-relaxed text-linen/70">
          Where traditional vegetarian heritage meets modern culinary innovation. Every plate is a carefully curated story meant to be savored in an atmosphere of unparalleled elegance.
        </p>
      </div>
    </section>
  );
}
