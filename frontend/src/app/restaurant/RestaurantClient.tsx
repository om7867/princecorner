"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { formatMoney } from "@/lib/types";
import type { MenuItemDTO } from "@/lib/types";
import { RESTAURANT_TASTING, RESTAURANT_HOURS, getVenue } from "@/data/venues";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "@/components/venues/shared";

const WINES = [
  { name: "Skin-contact Rhône white", note: "For the octopus — saline, apricot" },
  { name: "Old-vine Grenache", note: "For the lamb — dark cherry, woodsmoke" },
  { name: "Vintage Bual Madeira", note: "For the chocolate tart — burnt caramel" },
];

export function RestaurantClient({ items, siteName }: { items: MenuItemDTO[]; siteName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transparentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let ctx = gsap.context(() => {
      
      // 0. Buttery Smooth Video Scrubbing mapped ONLY to the transparent sections
      if (videoRef.current && transparentSectionRef.current) {
        
        // Wait for video metadata to be loaded so we know the duration
        const initVideoScroll = () => {
          const video = videoRef.current;
          if (!video || !video.duration) return;

          gsap.to(video, {
            currentTime: video.duration,
            ease: "none",
            scrollTrigger: {
              trigger: transparentSectionRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1, // 1 second smoothing for that "butter" feel
            }
          });
        };

        if (videoRef.current.readyState >= 1) {
          initVideoScroll();
        } else {
          videoRef.current.addEventListener('loadedmetadata', initVideoScroll);
        }
      }

      // 1. Cinematic Hero Scatter Animation
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle) {
        const split = new SplitType(heroTitle as HTMLElement, { types: 'chars' });
        
        gsap.to(split.chars, {
          z: 500,
          opacity: 0,
          rotationX: () => gsap.utils.random(-60, 60),
          rotationY: () => gsap.utils.random(-60, 60),
          x: () => gsap.utils.random(-200, 200),
          y: () => gsap.utils.random(-200, 200),
          filter: "blur(20px)",
          stagger: 0.02,
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          }
        });
      }

      // Fade out the surrounding hero elements
      gsap.to(".hero-fade-item", {
        y: -50,
        opacity: 0,
        filter: "blur(10px)",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "50% top",
          scrub: true,
        }
      });

      // 2. Sophisticated Line Reveals
      gsap.utils.toArray('.reveal-line').forEach((line: any) => {
        gsap.fromTo(line, 
          { scaleX: 0 },
          { 
            scaleX: 1, duration: 1.5, ease: "expo.out",
            scrollTrigger: { trigger: line, start: "top 90%" }
          }
        );
      });

      // Editorial Text Fades (One-time)
      gsap.utils.toArray('.editorial-fade').forEach((el: any) => {
        gsap.fromTo(el, 
          { y: 40, opacity: 0 },
          { 
            y: 0, opacity: 1, duration: 1.2, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
          }
        );
      });

      // 3. Scrubbing Text Reveal (Lights up character by character on scroll)
      gsap.utils.toArray('.scrub-reveal').forEach((el: any) => {
        const split = new SplitType(el, { types: 'words,chars' });
        gsap.fromTo(split.chars, 
          { opacity: 0.15 },
          { 
            opacity: 1,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 50%",
              scrub: 1,
            }
          }
        );
      });

      // 4. Scrubbing Gap Text Parallax
      gsap.utils.toArray('.gap-text').forEach((el: any) => {
        gsap.fromTo(el,
          { y: 80, scale: 0.95, opacity: 0 },
          {
            y: -80,
            scale: 1.05,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "bottom 10%",
              scrub: 1,
            }
          }
        );
      });

      // 5. Massive Horizontal Text Scrub (New Text Animation)
      gsap.fromTo('.massive-text-scrub',
        { x: "10vw" },
        {
          x: "-100vw",
          ease: "none",
          scrollTrigger: {
            trigger: '.massive-text-wrapper',
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0a0705] min-h-screen text-linen selection:bg-saffron selection:text-espresso relative font-body font-light">
      
      {/* Background Video Fixed Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#0a0705]">
        <video
          ref={videoRef}
          src="/restaurant-film.mp4"
          poster="/restaurant-film-poster.jpg"
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover scale-[1.06]"
        />
        {/* Subtle Vignette & Darkening Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(10,7,5,0.85)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-[#0a0705]/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-[#0a0705]/90 to-transparent" />
      </div>

      {/* Foreground Content Layer */}
      <main className="relative z-10 w-full flex flex-col items-center">
        
        {/* THIS WRAPPER DETERMINES THE VIDEO SCRUB LENGTH */}
        <div ref={transparentSectionRef} className="w-full relative">        
        
        {/* 1. HERO - Cinematic Scatter Animation */}
        <section className="hero-section h-[150vh] w-full relative">
          
          <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            
            {/* Very subtle edge darkening to frame the shot, but NO solid masks */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,7,5,0.4)_100%)] pointer-events-none z-0" />
            
            <div className="hero-content relative z-10 w-full flex flex-col items-center text-linen" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
              
              <p className="font-body text-xs md:text-sm uppercase tracking-[0.5em] mb-8 hero-fade-item text-saffron">
                Dinner Only
              </p>
              
              <h1 
                className="hero-title font-display text-[15vw] lg:text-[12rem] italic leading-[0.8] tracking-tighter text-center"
                style={{ perspective: '1000px' }}
              >
                The Restaurant
              </h1>
              
              <p className="font-body text-sm md:text-lg uppercase tracking-[0.4em] mt-12 opacity-90 hero-fade-item">
                Cooked over fire. Served without hurry.
              </p>

            </div>
            
            {/* CTA sits at the bottom of the screen */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 hero-fade-item">
              <Link
                href="/reserve"
                className="group flex flex-col items-center gap-4 text-xs uppercase tracking-[0.3em] text-linen hover:text-saffron transition-colors duration-500"
              >
                <span style={{ textShadow: '0 2px 10px rgba(0,0,0,1)' }}>Book the Dining Room</span>
                <div className="w-[1px] h-12 bg-linen group-hover:bg-saffron transition-colors duration-500 group-hover:h-16" />
              </Link>
            </div>
            
          </div>
        </section>

        {/* FILM GAP 1 */}
        <div className="h-[80vh] w-full flex items-center justify-center pointer-events-none">
          <div className="text-center gap-text" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
             <div className="w-[1px] h-12 bg-saffron/50 mx-auto mb-4" />
             <p className="font-display text-3xl md:text-5xl italic text-linen opacity-90">First, the sauce.</p>
          </div>
        </div>

        {/* 2. PHILOSOPHY - Cinematic Floating Text */}
        <section className="w-full relative z-20 text-linen" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>
           <div className="max-w-7xl mx-auto px-6 py-48 flex flex-col lg:flex-row gap-16 lg:gap-32">
             <div className="lg:w-1/3">
               <p className="text-xs uppercase tracking-[0.3em] mb-8 scrub-reveal text-saffron">The Philosophy</p>
               <h2 className="font-display text-4xl lg:text-6xl italic leading-[1.1] scrub-reveal">
                 One room.<br/>One fire.
               </h2>
             </div>
             <div className="lg:w-1/2 flex items-end">
               <p className="font-body text-2xl leading-relaxed scrub-reveal text-linen">
                 The menu is written each morning from whatever the market gave us. Every plate is finished by hand at the pass — you'll watch it happen.
               </p>
             </div>
           </div>
        </section>

        {/* FILM GAP 2 */}
        <div className="h-[60vh] w-full flex items-center justify-center pointer-events-none text-linen">
          <div className="text-center gap-text" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
             <div className="w-[1px] h-12 bg-saffron/50 mx-auto mb-4" />
             <p className="font-display text-3xl md:text-5xl italic opacity-90">Then, the mozzarella.</p>
          </div>
        </div>

        {/* 3. TASTING MENU - Fine Dining Print Layout (Floating) */}
        <section className="w-full relative z-20 text-linen" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>
           <div className="max-w-5xl mx-auto px-6 py-48">
             <div className="text-center mb-24 editorial-fade">
               <p className="text-xs uppercase tracking-[0.3em] mb-6 text-saffron">{RESTAURANT_TASTING.price}</p>
               <h2 className="font-display text-5xl lg:text-7xl italic mb-6">
                 {RESTAURANT_TASTING.title}
               </h2>
               <p className="font-body text-linen/70 tracking-widest uppercase text-sm">{RESTAURANT_TASTING.note}</p>
             </div>

             <div className="w-full reveal-line h-[1px] bg-white/20 mb-16 origin-center" />

             <div className="flex flex-col gap-12">
               {RESTAURANT_TASTING.courses.map((course, i) => (
                 <div key={course.order} className="flex flex-col lg:flex-row justify-between items-baseline gap-4 editorial-fade">
                   <div className="flex gap-8 items-baseline">
                     <span className="font-body text-xs tracking-[0.2em] text-saffron">COURSE 0{course.order}</span>
                     <h3 className="font-display text-3xl">{course.name}</h3>
                   </div>
                   <p className="font-body text-linen/80 lg:text-right max-w-sm">{course.dish}</p>
                 </div>
               ))}
             </div>
             
             <div className="w-full reveal-line h-[1px] bg-white/20 mt-16 origin-center" />
           </div>
        </section>

        {/* FILM GAP 3 - Massive Scrubbing Typography */}
        <div className="massive-text-wrapper h-[60vh] w-full flex items-center overflow-hidden pointer-events-none text-linen">
          <div className="massive-text-scrub whitespace-nowrap flex items-center gap-12" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
             <span className="font-display text-[15vw] italic text-linen/90">Ninety seconds.</span>
             <span className="font-display text-[15vw] italic text-saffron/90">Blistered.</span>
             <span className="font-display text-[15vw] italic text-linen/90">Done.</span>
             <span className="font-display text-[15vw] italic text-linen/90">Ninety seconds.</span>
             <span className="font-display text-[15vw] italic text-saffron/90">Blistered.</span>
             <span className="font-display text-[15vw] italic text-linen/90">Done.</span>
          </div>
        </div>
        </div>

        {/* BOTTOM CONTENT */}
        <div className="w-full relative z-20">
          
          {/* Smooth cinematic gradient transition from the video background to the solid page background */}
          <div className="w-full h-64 bg-gradient-to-b from-transparent to-[#0a0705]" />
          
          <div className="w-full bg-[#0a0705] pt-16 pb-16">
            
            {/* 4. A LA CARTE - Strict Geometric Grid */}
            <section className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-20 border-b border-white/10 pb-12 editorial-fade">
              <h2 className="font-display text-4xl lg:text-6xl italic text-linen">À La Carte</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-saffron hidden md:block">The dishes people cross town for</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {items.map((item, idx) => (
                <article key={item.id} className="group flex flex-col editorial-fade">
                  <div className="relative aspect-[3/4] w-full overflow-hidden mb-8 bg-[#181210]">
                    {item.photo_url && (
                      <Image
                        src={item.photo_url}
                        alt={item.photo_alt ?? item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale-[20%]"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="font-display text-2xl text-linen">{item.name}</h3>
                    <span className="font-body text-xs tracking-[0.2em] text-saffron">
                      {formatMoney(item.base_price)}
                    </span>
                  </div>
                  <p className="font-body text-sm text-linen/50 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
          
          {/* 5. CHEF QUOTE */}
          <section className="py-32 border-t border-white/10">
            <div className="max-w-4xl mx-auto px-6 text-center editorial-fade">
               <h2 className="font-display text-4xl md:text-5xl italic text-linen mb-12 leading-relaxed">
                 “A dish is ready when there is nothing left to take away.”
               </h2>
               <p className="font-body text-xs uppercase tracking-[0.3em] text-saffron">
                 — The Kitchen at {siteName}
               </p>
            </div>
          </section>

          {/* 6. WINE PAIRINGS & HOURS */}
          <section className="py-32 border-t border-white/10 bg-[#0f0b09]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24">
              
              <div className="editorial-fade">
                <p className="text-xs uppercase tracking-[0.3em] text-saffron mb-12">Wine & Pairings</p>
                <div className="w-full h-[1px] bg-white/10 mb-8" />
                <ul className="space-y-8">
                  {WINES.map((wine, i) => (
                    <li key={wine.name} className="flex justify-between items-baseline gap-8">
                      <h3 className="font-display text-xl text-linen">{wine.name}</h3>
                      <p className="font-body text-sm text-linen/40 text-right">{wine.note}</p>
                    </li>
                  ))}
                </ul>
                <div className="w-full h-[1px] bg-white/10 mt-8 mb-6" />
                <p className="font-body text-xs text-saffron tracking-[0.2em] uppercase text-right">
                  Full pairing flight +₹45
                </p>
              </div>

              <div className="editorial-fade">
                 <p className="text-xs uppercase tracking-[0.3em] text-saffron mb-12">Dinner Hours</p>
                 <div className="w-full h-[1px] bg-white/10 mb-8" />
                 <dl className="space-y-8">
                   {RESTAURANT_HOURS.map((row) => (
                     <div key={row.days} className="flex justify-between items-baseline gap-8">
                       <dt className="font-body text-sm text-linen/80 tracking-[0.2em] uppercase">{row.days}</dt>
                       <dd className="font-body text-sm text-linen/40">{row.time}</dd>
                     </div>
                   ))}
                 </dl>
                 <div className="w-full h-[1px] bg-white/10 mt-8" />
              </div>

            </div>
          </section>

          {/* 7. GALLERY, FAQ, CTA */}
          <section className="py-32 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6">
              <VenueGalleryBand venue={getVenue("restaurant")!} tone="dark" title="The room at golden hour" accentClass="text-saffron" />
              <div className="mt-32">
                <VenueFAQ venue={getVenue("restaurant")!} tone="dark" accentClass="text-saffron" />
              </div>
            </div>
          </section>

          <VenueCTABanner
            venue={getVenue("restaurant")!}
            siteName={siteName}
            title="Tonight deserves a better table"
            subtitle="Walk-ins welcome, but the fire seats go fast."
            primaryLabel="Reserve a Table"
          />

          </div>
        </div>
      </main>
    </div>
  );
}
