"use client";

import Image from "next/image";
import { useLuxuryReveal } from "@/hooks/useLuxuryReveal";

export function PrinceBentoGrid() {
  const containerRef = useLuxuryReveal();

  return (
    <section ref={containerRef as any} className="relative w-full bg-[#fdfbf7] py-32 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl flex flex-col items-center">
        
        <div className="text-center mb-20 max-w-2xl">
          <p className="luxury-paragraph mb-4 font-body text-xs font-bold uppercase tracking-[0.3em] text-[#b71c1c]">
            Our Footprint
          </p>
          <h2 className="luxury-heading font-display text-4xl sm:text-5xl lg:text-6xl leading-tight font-bold text-[#8B0000]">
            The Prince Empire.
          </h2>
          <p className="luxury-paragraph mt-6 font-body text-lg text-[#5c1f1f]">
            From a humble street-side cart to Gujarat's most recognizable street-food brand. We are rapidly expanding our footprint to ensure no one has to travel far for an authentic experience.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          
          {/* Main Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative rounded-3xl overflow-hidden bg-[#b71c1c] aspect-square md:aspect-auto flex flex-col justify-end p-8 lg:p-12 shadow-xl group">
            <div className="absolute inset-0 z-0">
              <Image 
                src="/food-photos/storefront_hero.jpg"
                alt="Isanpurwala Flagship"
                fill
                className="object-cover opacity-40 mix-blend-multiply transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#b71c1c] via-[#b71c1c]/50 to-transparent" />
            </div>
            <div className="relative z-10 flex flex-col">
              <div className="bg-white/20 backdrop-blur-md w-fit px-4 py-1.5 rounded-full mb-4">
                <span className="font-body text-xs font-bold uppercase tracking-widest text-white">Flagship</span>
              </div>
              <h3 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">Isanpur, Ahmedabad</h3>
              <p className="font-body text-lg text-white/90 max-w-md">
                Where it all began. The heart and soul of Prince Corner. A bustling epicenter of culinary chaos and perfect execution.
              </p>
            </div>
          </div>

          {/* Secondary Card */}
          <div className="col-span-1 rounded-3xl overflow-hidden bg-[#7f0000] p-8 lg:p-10 shadow-xl flex flex-col justify-between group relative min-h-[300px]">
            <div className="absolute inset-0 z-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40">
              <Image src="/food-photos/food_20.jpg" alt="Texture" fill className="object-cover" />
            </div>
            <div className="relative z-10">
              <h3 className="font-display text-3xl font-bold text-white mb-3">Maninagar</h3>
              <p className="font-body text-white/80">
                Our second home. Bringing the exact same uncompromising flavors to the heart of Maninagar.
              </p>
            </div>
            <div className="relative z-10 mt-12 flex items-center justify-between border-t border-white/20 pt-4">
              <span className="font-body text-sm font-medium text-white uppercase tracking-widest">Open Now</span>
            </div>
          </div>

          {/* Tertiary Card */}
          <div className="col-span-1 rounded-3xl bg-white border border-[#b71c1c]/10 p-8 lg:p-10 shadow-xl flex flex-col justify-between group relative min-h-[300px]">
            <div>
              <div className="h-12 w-12 rounded-full bg-[#fdfbf7] flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#b71c1c]">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                  <path d="M11 7H13V13H11V7Z" fill="currentColor"/>
                  <path d="M11 15H13V17H11V15Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="font-display text-3xl font-bold text-[#8B0000] mb-3">Coming Soon</h3>
              <p className="font-body text-[#5c1f1f]">
                We are actively expanding across Gujarat. Stay tuned for our next location announcement.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
