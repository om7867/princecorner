"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GALLERY_IMAGES } from "./data";

// Three columns, split round-robin, each column parallaxes at a slightly
// different speed — the classic masonry-parallax read as "depth" without
// any real 3D.
const COLUMN_SPEEDS = [0.12, -0.08, 0.16];

export function Gallery() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".gallery-col").forEach((col, i) => {
        gsap.to(col, {
          y: () => COLUMN_SPEEDS[i % COLUMN_SPEEDS.length] * 300,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const columns: string[][] = [[], [], []];
  GALLERY_IMAGES.forEach((img, i) => columns[i % 3].push(img));

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0B0B0B] py-32 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37]">Gallery</p>
        <h2 className="luxury-heading mt-4 font-display text-4xl italic text-[#FFF5E4] sm:text-6xl">
          A Glimpse Inside.
        </h2>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {columns.map((col, ci) => (
          <div key={ci} className="gallery-col flex flex-col gap-4 sm:gap-6">
            {col.map((img, i) => (
              <div
                key={img}
                className="group relative overflow-hidden rounded-2xl shadow-lg"
                style={{ aspectRatio: i % 2 === 0 ? "4/5" : "1/1" }}
              >
                <Image
                  src={img}
                  alt="Prince Corner gallery"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
