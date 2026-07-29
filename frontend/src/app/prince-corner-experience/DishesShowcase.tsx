"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { DISHES } from "./data";

const ONLINE_ORDER_URL = "/order?table=ONLINE&r=prince-corner-isanpur";
const SWIPE_THRESHOLD = 50; // px

export function DishesShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    const next = (index + DISHES.length) % DISHES.length;
    setActiveIndex(next);
  }, []);

  useEffect(() => {
    if (!trackRef.current) return;
    gsap.to(trackRef.current, {
      xPercent: -100 * activeIndex,
      duration: 0.8,
      ease: "power3.inOut",
    });
  }, [activeIndex]);

  function onPointerDown(e: React.PointerEvent) {
    pointerStartX.current = e.clientX;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (delta > SWIPE_THRESHOLD) goTo(activeIndex - 1);
    else if (delta < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
  }

  return (
    <section className="relative w-full bg-[#0B0B0B] py-24 sm:py-32">
      <div className="mx-auto mb-12 max-w-3xl px-6 text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Signature Dishes</p>
        <h2 className="luxury-heading mt-4 font-display text-4xl italic text-[#FFF5E4] sm:text-6xl">
          Five Dishes. <br /> One Legacy.
        </h2>
      </div>

      <div
        className="relative mx-auto h-[70vh] max-w-5xl touch-pan-y select-none overflow-hidden rounded-3xl sm:h-[80vh]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div ref={trackRef} className="flex h-full w-full">
          {DISHES.map((dish) => (
            <div key={dish.id} className="relative h-full w-full shrink-0">
              <Image
                src={dish.img}
                alt={dish.name}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover opacity-70"
                priority={dish.id === DISHES[0].id}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${dish.wash} to-[#0B0B0B]/85`} />

              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start p-8 sm:p-12">
                <span className="font-body text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Signature Dish
                </span>
                <h3 className="mt-3 font-display text-3xl italic text-[#FFF5E4] sm:text-5xl">{dish.name}</h3>
                <p className="mt-3 max-w-xl font-body text-sm text-[#FFF5E4]/75 sm:text-lg">{dish.desc}</p>
                <div className="mt-6 flex items-center gap-6">
                  <span className="font-display text-2xl italic text-[#D4AF37] sm:text-3xl">{dish.price}</span>
                  <Link
                    href={ONLINE_ORDER_URL}
                    className="rounded-full bg-[#D4AF37] px-6 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-[#0B0B0B] transition-transform hover:scale-105"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prev/next arrows */}
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          aria-label="Previous dish"
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#D4AF37]/40 bg-black/40 p-3 text-[#FFF5E4] backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-6"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          aria-label="Next dish"
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#D4AF37]/40 bg-black/40 p-3 text-[#FFF5E4] backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-6"
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {DISHES.map((dish, i) => (
          <button
            key={dish.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${dish.name}`}
            aria-current={i === activeIndex}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-8 bg-[#D4AF37]" : "w-2 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
