"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HIGHLIGHTS = [
  {
    icon: "👑",
    title: "40 Years of Legacy",
    body: "Serving Gujarat's most beloved street food, Punjabi curries, and South Indian dosas since 1985.",
  },
  {
    icon: "🌱",
    title: "100% Pure Vegetarian",
    body: "Uncompromising hygiene and 100% pure vegetarian kitchens, with Jain options available across menu items.",
  },
  {
    icon: "🔥",
    title: "Live Tawa Specialties",
    body: "Sizzling Pav Bhaji and butter-rich Tawa Pulao prepared fresh on live iron tawas with generous Amul butter.",
  },
  {
    icon: "🚀",
    title: "Fast Local Delivery",
    body: "Hot, piping fresh delivery straight to your doorstep from 4 convenient outlets across Ahmedabad.",
  },
];

export function HighlightsBand() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!sectionRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(".highlight-fade", 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      aria-label="Why guests love Prince Corner" 
      className="relative bg-gradient-to-b from-[#0e0b08] to-[#14100b] border-y border-white/10 px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="highlight-fade text-center mb-16">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron font-bold">
            The Prince Corner Promise
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl italic text-linen">
            Crafted for Authentic Taste &amp; Happiness
          </h2>
          <div className="mt-6 flex justify-center">
            <div className="h-10 w-[1px] bg-saffron/40" />
          </div>
        </div>

        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {HIGHLIGHTS.map((item) => (
            <li
              key={item.title}
              className="highlight-fade group cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-xl backdrop-blur-md transition-all duration-500 hover:border-saffron/40 hover:bg-white/[0.05] hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <div className="h-[2px] w-12 bg-saffron/30 transition-all duration-500 group-hover:w-full group-hover:bg-saffron" />
              <h3 className="mt-6 font-display text-2xl italic text-linen transition-colors group-hover:text-saffron">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-linen/70 font-light">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

