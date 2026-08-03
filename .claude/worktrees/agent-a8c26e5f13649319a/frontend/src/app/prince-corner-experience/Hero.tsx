"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { EmberParticles } from "./EmberParticles";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Line-by-line reveal, held a beat before the scroll-out begins.
      const split = new SplitType(titleRef.current as HTMLElement, { types: "words" });
      gsap.fromTo(
        split.words,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.4, ease: "power4.out", stagger: 0.12, delay: 0.3 }
      );

      // Slow Ken Burns push-in on the storefront photo, then the whole hero
      // scrubs out (scale + fade) as the next section approaches — reads as
      // "the camera moves closer into the food" without a real 3D dolly.
      gsap.to(bgRef.current, {
        scale: 1.18,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 1 },
      });
      gsap.to(sectionRef.current, {
        opacity: 0.15,
        scale: 0.94,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0B0B0B]"
    >
      <div ref={bgRef} className="absolute inset-0 z-0 scale-105">
        <Image
          src="/food-photos/storefront_hero.jpg"
          alt="A steaming bowl of Prince Special Pav Bhaji"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0B0B0B]" />
      </div>

      <EmberParticles color="#FF8A3D" count={50} />

      <div className="relative z-10 flex w-24 flex-col items-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.25)]">
          <Image src="/princelogo.png" alt="Prince Corner" fill className="object-cover" priority />
        </div>
      </div>

      <div className="relative z-10 mt-8 flex max-w-4xl flex-col items-center px-6 text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
          Serving Ahmedabad&rsquo;s Favourite Taste
        </p>
        <h1
          ref={titleRef}
          className="mt-6 overflow-hidden font-display text-5xl italic leading-[1.05] text-[#FFF5E4] sm:text-7xl lg:text-8xl"
        >
          Prince Corner
        </h1>
        <p className="luxury-paragraph mt-8 max-w-xl font-body text-lg text-[#FFF5E4]/70">
          A steaming bowl. Melting butter. A recipe unchanged since the first tawa. This is the story.
        </p>

        <Link
          href="#dishes"
          className="mt-10 rounded-full bg-[#D4AF37] px-8 py-3 font-body text-sm font-semibold uppercase tracking-[0.15em] text-[#0B0B0B] shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-transform hover:scale-105"
        >
          Begin the Story
        </Link>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-70">
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#FFF5E4]">Scroll</span>
        <div className="h-10 w-px bg-gradient-to-b from-[#D4AF37] to-transparent" />
      </div>
    </section>
  );
}
