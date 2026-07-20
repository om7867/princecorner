"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { formatMoney } from "@/lib/types";
import type { MenuItemDTO } from "@/lib/types";
import { CAFE_BREWS, CAFE_MORNING, getVenue } from "@/data/venues";
import { VenueGalleryBand, VenueFAQ, VenueCTABanner } from "@/components/venues/shared";

export function CafeClient({ items, siteName }: { items: MenuItemDTO[]; siteName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let ctx = gsap.context(() => {
      
      // 1. Hero Kinetic Typography Reveal
      if (heroTextRef.current) {
        const split = new SplitType(heroTextRef.current, { types: 'words,chars' });
        gsap.from(split.chars, {
          y: 100,
          opacity: 0,
          rotateX: -90,
          stagger: 0.02,
          duration: 1.5,
          ease: "expo.out",
          delay: 0.2,
        });
      }

      // 2. Expanding Video Hero on Scroll
      gsap.to(".hero-video-wrapper", {
        width: "100%",
        height: "100vh",
        borderRadius: "0px",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
        }
      });

      // 3. Horizontal Pinned Scroll (Desktop Only)
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const wrapper = horizontalWrapperRef.current;
        if (wrapper) {
          const scrollWidth = wrapper.scrollWidth - window.innerWidth;
          gsap.to(wrapper, {
            x: -scrollWidth,
            ease: "none",
            scrollTrigger: {
              trigger: horizontalSectionRef.current,
              start: "top top",
              end: () => `+=${scrollWidth}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            }
          });
        }
      });

      // 4. Parallax Image Reveals for Counter Items
      gsap.utils.toArray('.menu-item-card').forEach((card: any) => {
        const image = card.querySelector('.menu-item-image');
        
        gsap.fromTo(card, 
          { y: 100, opacity: 0 },
          { 
            y: 0, opacity: 1, duration: 1, ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            }
          }
        );

        if (image) {
          gsap.fromTo(image,
            { scale: 1.2, y: -20 },
            { 
              scale: 1, y: 0, ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true
              }
            }
          );
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-linen min-h-screen text-espresso selection:bg-terracotta selection:text-linen">
      
      {/* 1. HERO SECTION */}
      <section className="hero-section relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        <div className="absolute top-10 left-0 w-full px-6 md:px-12 flex justify-between z-20 mix-blend-difference text-linen">
          <span className="font-body text-xs uppercase tracking-widest">{siteName} — The Café</span>
          <span className="font-body text-xs uppercase tracking-widest">Open 7am Daily</span>
        </div>

        {/* The slit video that expands */}
        <div className="hero-video-wrapper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[60vw] h-[40vh] md:h-[50vh] rounded-[3rem] overflow-hidden z-0">
           <video
            ref={heroVideoRef}
            src="/cafe-film.mp4"
            poster="/cafe-film-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-espresso/20" />
        </div>

        <h1 
          ref={heroTextRef}
          className="relative z-10 font-display text-[12vw] md:text-[8vw] leading-[0.8] text-center text-linen mix-blend-difference italic pointer-events-none"
          style={{ perspective: '1000px' }}
        >
          Your morning,<br />slower.
        </h1>

      </section>

      {/* 2. HORIZONTAL SCROLL SECTION (The Beans & The Brew Bar) */}
      <section ref={horizontalSectionRef} className="relative bg-espresso text-linen overflow-hidden">
        <div ref={horizontalWrapperRef} className="flex flex-col lg:flex-row h-auto lg:h-screen w-full lg:w-max">
          
          {/* Panel 1: Intro - Awwwards Style Kinetic Layout */}
          <div className="w-full lg:w-[120vw] h-[50vh] lg:h-screen flex items-center relative overflow-hidden shrink-0 pl-12 lg:pl-32">
             
             {/* Massive Background Parallax Text */}
             <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-[0.03] pointer-events-none whitespace-nowrap">
               <span className="font-display text-[30vw] uppercase tracking-tighter leading-none">
                 ROASTED IN HOUSE
               </span>
             </div>

             <div className="relative z-10 max-w-4xl flex flex-col lg:flex-row gap-12 lg:gap-24 items-start lg:items-center">
               <div className="lg:w-1/2">
                 <h2 className="font-display text-6xl lg:text-8xl italic text-linen leading-[0.9]">
                   Three weeks<br/>
                   <span className="text-terracotta">from farm</span><br/>
                   to cup.
                 </h2>
               </div>
               <div className="lg:w-1/2">
                 <div className="w-12 h-[2px] bg-terracotta mb-8" />
                 <p className="font-body text-lg lg:text-2xl text-linen/70 leading-relaxed max-w-lg font-light">
                   A single-origin lot from a farm we can name, roasted twenty steps
                   from where it&apos;s poured, rested three days, and dialed in
                   before the doors open. Whatever you order, it was a green bean
                   less than a month ago.
                 </p>
               </div>
             </div>
          </div>

          {/* Panel 2: The Brew Bar - Overlapping Gallery Style */}
          <div className="w-full lg:w-[200vw] h-auto lg:h-screen flex items-center p-12 lg:p-32 shrink-0 relative">
            
            {/* Background Graphic */}
            <div className="absolute right-0 bottom-0 w-[50vw] h-[50vw] bg-terracotta/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="flex flex-col lg:flex-row gap-24 w-full h-full items-center">
              
              {/* Sticky Title Block inside the horizontal scroll */}
              <div className="lg:w-[30vw] shrink-0 relative z-10">
                <p className="font-body text-sm uppercase tracking-[0.4em] text-terracotta mb-6 flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-terracotta" />
                  The Brew Bar
                </p>
                <h2 className="font-display text-6xl lg:text-8xl italic text-linen leading-none">
                  Four ways<br/>to take<br/>your coffee.
                </h2>
              </div>

              {/* Unique Staggered Cards */}
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full items-center">
                {CAFE_BREWS.map((brew, idx) => {
                  // Create a staggered vertical offset for the cards to make it look organic
                  const offsetClass = idx % 2 === 0 ? "lg:-translate-y-12" : "lg:translate-y-12";
                  
                  return (
                    <div 
                      key={brew.name} 
                      className={`group relative w-full lg:w-[28vw] h-[350px] lg:h-[60vh] rounded-[2rem] border border-white/5 bg-[#1a130f] p-10 flex flex-col justify-between transition-transform duration-700 hover:scale-[1.02] hover:bg-[#1f1712] ${offsetClass}`}
                    >
                      {/* Giant Number Indicator */}
                      <span className="absolute top-4 right-8 font-display text-8xl italic text-white/[0.03] pointer-events-none transition-colors duration-500 group-hover:text-terracotta/[0.05]">
                        0{idx + 1}
                      </span>
                      
                      <div className="relative z-10">
                        <span className="inline-block px-4 py-1.5 rounded-full border border-terracotta/30 text-terracotta font-body text-xs tracking-[0.2em] uppercase mb-8">
                          {brew.price}
                        </span>
                        <h3 className="font-display text-4xl text-linen mb-6">{brew.name}</h3>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent mb-6" />
                        <p className="font-body text-lg text-linen/50 leading-relaxed font-light">
                          {brew.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. MINIMALIST MASONRY: From The Counter */}
      <section className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-espresso/10 pb-12">
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-terracotta mb-4">From the Counter</p>
            <h2 className="font-display text-5xl md:text-7xl italic text-espresso">Best enjoyed before noon.</h2>
          </div>
          <Link href="/order?table=T1" className="group relative inline-flex items-center gap-4 mt-8 md:mt-0">
             <span className="font-body text-sm font-bold uppercase tracking-widest text-espresso">Order Ahead</span>
             <div className="w-12 h-12 rounded-full border border-espresso flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:bg-terracotta group-hover:border-terracotta group-hover:text-linen">
               <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-1">
                 <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
          {items.map((item, idx) => (
            <article key={item.id} className="menu-item-card group cursor-pointer">
              <div className="relative aspect-[3/4] w-full overflow-hidden mb-8 rounded-sm">
                {item.photo_url ? (
                  <Image
                    src={item.photo_url}
                    alt={item.photo_alt ?? item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="menu-item-image object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-charcoal" />
                )}
                {/* Minimal Overlay on hover */}
                <div className="absolute inset-0 bg-espresso/0 transition-colors duration-500 group-hover:bg-espresso/10" />
              </div>

              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h3 className="font-display text-2xl text-espresso">{item.name}</h3>
                <span className="font-body text-sm font-bold tracking-widest text-terracotta">
                  {formatMoney(item.base_price)}
                </span>
              </div>
              
              <div className="w-full h-[1px] bg-espresso/10 mb-4 transition-transform duration-700 origin-left group-hover:scale-x-0" />
              
              <p className="font-body text-sm text-espresso/70 leading-relaxed pr-4">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. CLEAN TYPOGRAPHY FOOTER: The Morning Timeline */}
      <section className="bg-linen-soft py-32 border-t border-espresso/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="font-display text-5xl md:text-7xl italic text-espresso">How a morning here goes</h2>
          </div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-24 top-0 bottom-0 w-[1px] bg-terracotta/20" />
            
            <ul className="space-y-16">
              {CAFE_MORNING.map((slot, idx) => (
                <li key={slot.time} className="relative flex items-start gap-8 md:gap-16">
                  <div className="absolute left-[29px] md:left-[93px] top-3 w-2 h-2 rounded-full bg-terracotta" />
                  <span className="w-16 md:w-24 shrink-0 text-right font-display text-2xl md:text-3xl italic text-terracotta">
                    {slot.time}
                  </span>
                  <p className="font-body text-lg md:text-xl text-espresso/80 pt-1 leading-relaxed">
                    {slot.event}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. COFFEE CLUB */}
      <section className="bg-linen py-32 border-t border-espresso/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <p className="font-body text-xs uppercase tracking-widest text-terracotta mb-6">The Coffee Club</p>
           <h2 className="font-display text-5xl md:text-7xl italic text-espresso mb-8">Ninth cup on the house.</h2>
           <p className="font-body text-lg md:text-xl text-espresso/70 leading-relaxed max-w-2xl mx-auto mb-12">
             A paper stamp card, like it should be. Take home a 250g bag of
             this week&apos;s roast and get two stamps — ask the barista
             what they&apos;re drinking; it&apos;s usually the right answer.
           </p>
           <Link href="/reserve" className="group relative inline-flex items-center gap-4">
             <span className="font-body text-sm font-bold uppercase tracking-widest text-espresso">Come In and Join</span>
             <div className="w-12 h-12 rounded-full border border-espresso flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:bg-terracotta group-hover:border-terracotta group-hover:text-linen">
               <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-1">
                 <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
           </Link>
        </div>
      </section>

      {/* 6. GALLERY & FAQ */}
      <section className="bg-linen-soft py-32 border-t border-espresso/10">
        <div className="max-w-7xl mx-auto px-6">
          <VenueGalleryBand
            venue={getVenue("cafe")!}
            tone="light"
            eyebrow="The Space"
            title="Sun, steam, and somewhere to sit"
            accentClass="text-terracotta"
          />
          <div className="mt-24">
            <VenueFAQ venue={getVenue("cafe")!} tone="light" accentClass="text-terracotta" />
          </div>
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <VenueCTABanner
        venue={getVenue("cafe")!}
        siteName={siteName}
        title="Tomorrow morning, then?"
        subtitle="First batch of filter is brewed by 7. The window seats go to the early risers."
        primaryLabel="Reserve a Spot"
      />
      
    </div>
  );
}
