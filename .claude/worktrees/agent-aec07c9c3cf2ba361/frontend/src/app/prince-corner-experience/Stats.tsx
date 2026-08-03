"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EmberParticles } from "./EmberParticles";
import { STATS } from "./data";

export function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        const target = Number(el.dataset.value);
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(proxy.val).toLocaleString();
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0B0B0B] py-32 px-6">
      <EmberParticles color="#D4AF37" count={25} />
      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-2 gap-12 text-center lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <p className="font-display text-5xl italic text-[#D4AF37] sm:text-6xl">
              <span className="stat-number" data-value={stat.value}>
                0
              </span>
              {stat.suffix}
            </p>
            <p className="mt-3 font-body text-xs uppercase tracking-[0.25em] text-[#FFF5E4]/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
