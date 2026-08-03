"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TIMELINE } from "./data";

export function Timeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%", end: "bottom 80%", scrub: 1 },
        }
      );

      gsap.utils.toArray<HTMLElement>(".timeline-node").forEach((node, i) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 60, x: i % 2 === 0 ? -40 : 40 },
          { opacity: 1, y: 0, x: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: node, start: "top 85%" } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#FFF5E4] py-32 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#C62828]">The Story</p>
        <h2 className="luxury-heading mt-4 font-display text-4xl italic text-[#0B0B0B] sm:text-6xl">
          A Decade of Devotion.
        </h2>
      </div>

      <div className="relative mx-auto mt-24 max-w-3xl">
        <div
          ref={lineRef}
          className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#D4AF37] to-[#D4AF37]/20"
          aria-hidden
        />

        <div className="flex flex-col gap-20">
          {TIMELINE.map((item, i) => (
            <div
              key={item.title}
              className={`timeline-node relative flex flex-col items-center gap-6 sm:flex-row ${
                i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center self-center rounded-full bg-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.7)] sm:absolute sm:left-1/2 sm:-translate-x-1/2" />

              <div className={`w-full sm:w-1/2 ${i % 2 === 0 ? "sm:pr-14 sm:text-right" : "sm:pl-14 sm:text-left"}`}>
                <span className="font-body text-xs font-bold uppercase tracking-[0.3em] text-[#C62828]">{item.year}</span>
                <h3 className="mt-2 font-display text-2xl italic text-[#0B0B0B] sm:text-3xl">{item.title}</h3>
                <p className="mt-2 font-body text-sm text-[#0B0B0B]/60">{item.desc}</p>
              </div>

              <div className={`w-full sm:w-1/2 ${i % 2 === 0 ? "sm:pl-14" : "sm:pr-14"}`}>
                <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-2xl shadow-xl sm:max-w-none">
                  <Image src={item.img} alt={item.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 400px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
