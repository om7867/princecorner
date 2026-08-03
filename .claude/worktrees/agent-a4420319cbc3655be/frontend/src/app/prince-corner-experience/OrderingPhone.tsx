"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STEPS = [
  { label: "Browse", desc: "Explore the full menu, curated by category." },
  { label: "Add to Cart", desc: "Build your order — extra butter included, always." },
  { label: "Checkout", desc: "Pay securely, in seconds." },
  { label: "Live Tracking", desc: "Watch your order leave the kitchen in real time." },
  { label: "Delivered", desc: "Hot, fresh, and exactly on time." },
] as const;

export function OrderingPhone() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const proxy = { step: 0 };
      gsap.to(proxy, {
        step: STEPS.length - 1,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "+=180%", scrub: 1, pin: true },
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
    <section ref={sectionRef} className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0B0B0B] px-6">
      <div className="relative z-10 mb-12 text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Online Ordering</p>
        <h2 className="mt-4 font-display text-3xl italic text-[#FFF5E4] sm:text-5xl">From Craving to Doorstep.</h2>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 sm:flex-row sm:gap-20">
        {/* Phone frame */}
        <div className="relative h-[420px] w-[210px] rounded-[2.5rem] border-4 border-[#2a2a2a] bg-[#111] p-2 shadow-[0_0_60px_rgba(212,175,55,0.15)]">
          <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#2a2a2a]" />
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#1a1512] to-[#0B0B0B]">
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center transition-opacity duration-500"
                style={{ opacity: i === active ? 1 : 0 }}
              >
                {i < 2 && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl">
                    <Image src="/menu-photos/menu_01.jpg" alt="" fill className="object-cover" sizes="96px" />
                  </div>
                )}
                {i === 2 && (
                  <div className="flex w-full flex-col gap-2">
                    <div className="h-8 rounded-lg bg-[#D4AF37]/20" />
                    <div className="h-8 rounded-lg bg-[#D4AF37]" />
                  </div>
                )}
                {i === 3 && (
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#D4AF37] text-2xl">
                    🛵
                  </div>
                )}
                {i === 4 && <div className="text-4xl">✅</div>}
                <p className="font-display text-lg italic text-[#FFF5E4]">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              className={`flex items-center gap-4 rounded-2xl border px-5 py-3 transition-all duration-500 ${
                i === active
                  ? "border-[#D4AF37]/60 bg-[#D4AF37]/10"
                  : "border-transparent opacity-40"
              }`}
            >
              <span className="font-display text-xl italic text-[#D4AF37]">{i + 1}</span>
              <div>
                <p className="font-body text-sm font-semibold text-[#FFF5E4]">{step.label}</p>
                <p className="font-body text-xs text-[#FFF5E4]/50">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
