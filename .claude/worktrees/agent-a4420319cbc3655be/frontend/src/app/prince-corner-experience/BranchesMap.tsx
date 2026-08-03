"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRANCHES } from "./data";

export function BranchesMap() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section || window.innerWidth < 1024) return;

      const totalScroll = track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: () => `+=${totalScroll}`, scrub: 1, pin: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0B0B0B] lg:h-screen">
      <div className="pointer-events-none absolute left-1/2 top-10 z-20 w-full max-w-3xl -translate-x-1/2 px-6 text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Explore Ahmedabad</p>
        <h2 className="mt-4 font-display text-3xl italic text-[#FFF5E4] sm:text-5xl">Every Branch, One Legacy.</h2>
      </div>

      <div ref={trackRef} className="flex h-full items-center gap-8 pt-40 lg:w-max lg:flex-row lg:gap-16 lg:px-24">
        {BRANCHES.map((branch) => (
          <div
            key={branch.name}
            className="branch-pin group relative flex w-[85vw] shrink-0 flex-col overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#141210] shadow-2xl sm:w-[420px]"
          >
            <div className="relative h-56 w-full">
              <Image src={branch.img} alt={branch.name} fill className="object-cover" sizes="420px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-[#0B0B0B] shadow-[0_0_16px_rgba(212,175,55,0.6)]">
                ●
              </span>
            </div>
            <div className="flex flex-col gap-3 p-6">
              <h3 className="font-display text-2xl italic text-[#FFF5E4]">{branch.name}</h3>
              <p className="font-body text-sm text-[#FFF5E4]/50">{branch.area}</p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-[#D4AF37]">Hours</p>
                  <p className="font-body text-[#FFF5E4]/80">{branch.hours}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-[#D4AF37]">Popular</p>
                  <p className="font-body text-[#FFF5E4]/80">{branch.dish}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-[#D4AF37]">Rating</p>
                  <p className="font-body text-[#FFF5E4]/80">★ {branch.rating}</p>
                </div>
              </div>
              <button className="mt-3 w-full rounded-full border border-[#D4AF37]/50 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37] transition-colors hover:bg-[#D4AF37] hover:text-[#0B0B0B]">
                Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
