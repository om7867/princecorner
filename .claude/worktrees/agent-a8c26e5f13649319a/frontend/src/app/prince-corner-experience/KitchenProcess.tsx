"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EmberParticles } from "./EmberParticles";
import { KITCHEN_STEPS } from "./data";

export function KitchenProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const proxy = { step: 0 };
      gsap.to(proxy, {
        step: KITCHEN_STEPS.length - 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
        },
        onUpdate: () => {
          const next = Math.round(proxy.step);
          if (next !== activeRef.current) {
            activeRef.current = next;
            setActive(next);
          }
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0B0B0B]">
      <EmberParticles color="#FF8A3D" count={30} />

      <div className="relative z-10 mb-10 text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Inside the Kitchen</p>
        <h2 className="mt-4 font-display text-3xl italic text-[#FFF5E4] sm:text-5xl">Where Every Order Begins.</h2>
      </div>

      <div className="relative z-10 h-[45vh] w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl">
        {KITCHEN_STEPS.map((step, i) => (
          <div
            key={step.caption}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image src={step.img} alt={step.caption} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 font-display text-xl italic text-[#FFF5E4]">{step.caption}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-8 flex gap-2">
        {KITCHEN_STEPS.map((step, i) => (
          <div
            key={step.caption}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-8 bg-[#D4AF37]" : "w-1.5 bg-[#D4AF37]/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
