"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { RATING, REVIEWS } from "./data";

export function ReviewBubbles() {
  useEffect(() => {
    const bubbles = gsap.utils.toArray<HTMLElement>(".review-bubble");
    const tweens = bubbles.map((bubble, i) =>
      gsap.to(bubble, {
        y: i % 2 === 0 ? "+=18" : "-=18",
        rotate: i % 2 === 0 ? 2 : -2,
        duration: 3 + i * 0.25,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      })
    );
    return () => tweens.forEach((t) => t.kill());
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#FFF5E4] py-32 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#C62828]">Customer Love</p>
        <h2 className="luxury-heading mt-4 font-display text-4xl italic text-[#0B0B0B] sm:text-6xl">
          Thousands of Happy Tables.
        </h2>
        <p className="mt-4 font-body text-sm font-semibold text-[#0B0B0B]/70">
          ★ {RATING.score} · {RATING.count} reviews on {RATING.source}
        </p>
        <p className="mx-auto mt-2 max-w-md font-body text-xs text-[#0B0B0B]/40">
          The kind of thing our regulars tell us — paraphrased, not verbatim quotes.
        </p>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((review) => (
          <div
            key={review.name}
            className="review-bubble group relative flex flex-col gap-4 rounded-[2.5rem] border border-[#0B0B0B]/10 bg-white/60 p-8 shadow-lg backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C62828] font-body text-sm font-bold text-white">
                {review.initials}
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-[#0B0B0B]">{review.name}</p>
                <p className="font-body text-xs text-[#D4AF37]">{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</p>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed text-[#0B0B0B]/70">&ldquo;{review.text}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
