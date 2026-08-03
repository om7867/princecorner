"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DISHES } from "./data";

export function DishesShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const isMobile = window.innerWidth < 1024;
      if (isMobile) return; // mobile: stack vertically instead of pinning (see className below)

      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalScroll}`,
          scrub: 1,
          pin: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Cursor-follow tilt on the dish info card — lightweight CSS perspective
  // tilt, not a real 3D object (mirrors the wheel-tilt feel of the existing
  // PrinceCarousel/PrinceBranchWheel without extra 3D geometry).
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".dish-tilt-wrap"));
    const handlers = cards.map((card) => {
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, { rotateY: px * 8, rotateX: -py * 8, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
      };
      const onLeave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      return { card, onMove, onLeave };
    });
    return () => handlers.forEach(({ card, onMove, onLeave }) => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0B0B0B] lg:h-screen">
      <div
        ref={trackRef}
        className="flex flex-col lg:h-full lg:w-max lg:flex-row"
      >
        {DISHES.map((dish) => (
          <div key={dish.id} className="relative flex h-screen w-full shrink-0 items-center justify-center lg:w-screen">
            <Image src={dish.img} alt={dish.name} fill sizes="100vw" className="object-cover opacity-60" />
            <div className={`absolute inset-0 bg-gradient-to-t ${dish.wash} to-[#0B0B0B]/80`} />

            <div className="dish-tilt-wrap relative z-10 mx-6 flex max-w-xl flex-col items-start rounded-3xl border border-[#D4AF37]/20 bg-black/30 p-8 backdrop-blur-md transition-transform duration-300 sm:p-12">
              <span className="font-body text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Signature Dish
              </span>
              <h3 className="mt-4 font-display text-4xl italic text-[#FFF5E4] sm:text-5xl">{dish.name}</h3>
              <p className="mt-4 font-body text-base text-[#FFF5E4]/75 sm:text-lg">{dish.desc}</p>
              <div className="mt-8 flex items-center gap-6">
                <span className="font-display text-3xl italic text-[#D4AF37]">{dish.price}</span>
                <button className="rounded-full bg-[#D4AF37] px-6 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-[#0B0B0B] transition-transform hover:scale-105">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
