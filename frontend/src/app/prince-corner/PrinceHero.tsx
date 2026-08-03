"use client";

import Image from "next/image";
import { useLuxuryReveal } from "@/hooks/useLuxuryReveal";

export function PrinceHero() {
  const containerRef = useLuxuryReveal();

  return (
    <section 
      ref={containerRef as any}
      className="relative flex h-screen w-full flex-col items-center justify-center bg-[#0e0b08] overflow-hidden"
    >
      {/* Top Navbar for Logo */}
      <div className="absolute top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
        <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-full border-2 border-white/20 shadow-2xl pointer-events-auto">
          {/* Logo with object-cover to crop out white borders if any */}
          <Image 
            src="/princelogo.png" 
            alt="Prince Corner Logo" 
            fill
            sizes="(max-width: 768px) 96px, 128px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/food-photos/storefront_hero.jpg" // Outlet photo as requested
          alt="Prince Corner Culinary Experience"
          fill
          className="object-cover opacity-60 scale-105 transition-transform duration-[30000ms] ease-out hover:scale-110"
          priority
          sizes="100vw"
        />
        {/* Deep, luxurious red/black gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#b71c1c]/40 to-[#0e0b08]/90" />
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl px-6 text-center mt-12">
        
        {/* Elegant Tagline */}
        <p className="luxury-paragraph font-body text-sm sm:text-base font-bold uppercase tracking-[0.4em] text-white/90">
          The Authentic Experience
        </p>
        <h1 className="luxury-heading mt-6 font-display text-5xl sm:text-7xl lg:text-[7rem] leading-[1.1] text-white font-bold drop-shadow-lg">
          Taste the <br />
          <span className="italic font-medium text-[#fca5a5]">Legacy.</span>
        </h1>
        <p className="luxury-paragraph mt-8 font-body text-lg text-white/80 max-w-2xl">
          From a humble stall to Gujarat's finest street food destination. Uncompromising flavors, everyday.
        </p>

      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70 animate-pulse z-20">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-white">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
