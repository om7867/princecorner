"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const REVIEWS = [
  {
    quote:
      "The truffle pav bhaji is the reason we moved our anniversary dinner here — three years running now.",
    name: "Priya & Daniel",
    source: "Google Reviews",
    stars: 5,
  },
  {
    quote:
      "I came for a coffee, stayed for four hours, and left with a loaf of bread and a dinner reservation.",
    name: "Marcus T.",
    source: "Yelp",
    stars: 5,
  },
  {
    quote:
      "The chef's counter is the best seat in the city. Watching the fire while they narrate each course — unforgettable.",
    name: "Aiko S.",
    source: "TripAdvisor",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div
      aria-label={`${count} out of 5 stars`}
      className="flex gap-1 text-saffron"
    >
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 14 14" aria-hidden>
          <path
            d="M7 1l1.8 3.9 4.2.5-3.1 2.9.8 4.2L7 10.4 3.3 12.5l.8-4.2L1 5.4l4.2-.5L7 1z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".testimonial-card");
      gsap.fromTo(cards, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
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
      id="reviews"
      ref={sectionRef}
      aria-label="What guests say"
      className="bg-[#080605] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="luxury-paragraph font-body text-xs uppercase tracking-[0.35em] text-saffron">
            Word of Mouth
          </p>
          <h2 className="luxury-heading mt-4 text-balance font-display text-5xl italic text-linen sm:text-7xl">
            What our guests keep saying
          </h2>
        </div>

        <ul className="mt-20 grid gap-8 md:grid-cols-3" role="list">
          {REVIEWS.map((review) => (
            <li
              key={review.name}
              className="testimonial-card premium-hover flex flex-col rounded-3xl border border-linen/5 bg-charcoal/50 p-10 transition-colors duration-700 hover:border-saffron/20"
            >
              <Stars count={review.stars} />
              <blockquote className="mt-8 flex-1">
                <p className="font-display text-2xl italic leading-relaxed text-linen/90">
                  “{review.quote}”
                </p>
              </blockquote>
              <footer className="mt-10 flex items-baseline justify-between gap-3 border-t border-linen/10 pt-6">
                <span className="font-body text-sm font-semibold tracking-wider text-saffron">
                  {review.name}
                </span>
                <span className="font-body text-xs tracking-widest text-linen/40 uppercase">
                  {review.source}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
