"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HIGHLIGHTS = [
  {
    title: "Farm to table",
    body: "Produce, dairy, and spices sourced from local growers within a day's drive, not a warehouse.",
  },
  {
    title: "Cooked over fire",
    body: "Every hearth dish finishes on live coals — the same way it did on day one.",
  },
  {
    title: "Fresh baked daily",
    body: "The bakery starts before sunrise so the bread on your table is always same-day.",
  },
  {
    title: "Award-winning",
    body: "Recognized three years running for our wine list and chef's tasting menu.",
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
          duration: 1.5,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      aria-label="Why guests love us" 
      className="bg-linen px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="highlight-fade text-center mb-24">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
            Our Philosophy
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-12 w-[1px] bg-espresso/20" />
          </div>
        </div>

        <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {HIGHLIGHTS.map((item) => (
            <li
              key={item.title}
              className="highlight-fade flex flex-col group cursor-pointer"
            >
              <div className="h-[1px] w-full bg-espresso/10 transition-colors duration-700 group-hover:bg-terracotta" />
              <h3 className="mt-8 font-display text-2xl italic text-espresso transition-transform duration-700 group-hover:translate-x-2">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-espresso/70 transition-transform duration-700 group-hover:translate-x-2">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
