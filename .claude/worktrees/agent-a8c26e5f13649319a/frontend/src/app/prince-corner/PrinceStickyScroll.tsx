"use client";

import Image from "next/image";
import { useLuxuryReveal } from "@/hooks/useLuxuryReveal";

export function PrinceStickyScroll() {
  useLuxuryReveal();

  const sections = [
    {
      id: "punjabi",
      title: "Rich Punjabi.",
      desc: "Buttery, aromatic, and deeply satisfying. Our Punjabi dishes are slow-cooked to perfection, honoring the heritage of North Indian dhabas while presenting them with uncompromised hygiene and premium ingredients.",
      img: "/food-photos/food_01.jpg",
    },
    {
      id: "chinese",
      title: "Wok-Tossed.",
      desc: "The unmistakable smoky flavor of the wok. Our Indian-Chinese plates are fiery, tangy, and packed with the chaotic energy of the streets, balanced with absolute culinary precision.",
      img: "/food-photos/food_12.jpg",
    },
    {
      id: "dosa",
      title: "Golden Dosa.",
      desc: "Flawlessly crisp, paper-thin, and golden brown. Served with piping hot sambar and fresh coconut chutney. It's the reason locals cross town to visit us.",
      img: "/food-photos/food_05.jpg",
    },
  ];

  return (
    <section className="relative w-full bg-white text-[#b71c1c]">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        
        {/* Sticky Left Column */}
        <div className="lg:sticky lg:top-0 flex h-auto lg:h-screen w-full lg:w-5/12 flex-col justify-center px-6 py-20 lg:px-12 z-10">
          <p className="luxury-paragraph mb-6 font-body text-xs font-bold uppercase tracking-[0.3em] text-[#8B0000]">
            The Menu
          </p>
          <h2 className="luxury-heading font-display text-5xl sm:text-6xl lg:text-7xl leading-tight font-bold text-[#b71c1c]">
            A Collision of <br /> Cultures.
          </h2>
          <p className="luxury-paragraph mt-8 max-w-sm font-body text-lg leading-relaxed text-[#5c1f1f]">
            Three distinct culinary worlds, brought together under one roof. We don't do fusion; we do perfection in every category.
          </p>
        </div>

        {/* Scrolling Right Column */}
        <div className="w-full lg:w-7/12 flex flex-col gap-12 px-6 pb-32 pt-12 lg:px-12 lg:pt-[30vh]">
          {sections.map((sec, i) => (
            <div key={sec.id} className="flex flex-col mb-16 lg:mb-32">
              <div className="luxury-image-container relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={sec.img}
                  alt={sec.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="mt-8 flex flex-col">
                <h3 className="luxury-heading font-display text-4xl font-bold text-[#8B0000]">
                  {sec.title}
                </h3>
                <p className="luxury-paragraph mt-4 max-w-md font-body text-lg text-[#5c1f1f]">
                  {sec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
