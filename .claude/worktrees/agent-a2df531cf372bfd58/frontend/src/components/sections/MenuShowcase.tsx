"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { formatMoney } from "@/lib/types";
import type { CategoryDTO, MenuItemDTO } from "@/lib/types";
import { MOCK_CATEGORIES } from "@/data/mockMenu";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DIETARY_LABEL: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  "contains-nuts": "Contains nuts",
};

export function MenuShowcase({ items: allItems }: { items: MenuItemDTO[] }) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    // Backend is off; use mock categories directly to keep the terminal completely clean.
    setCategories(MOCK_CATEGORIES);
    setActiveCategoryId(MOCK_CATEGORIES[0]?.id ?? null);
  }, [allItems]);

  const activeItems = allItems.filter((item) => item.category_id === activeCategoryId);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  
  // The image to display: if hovering, show the hovered item's image. Otherwise, show the first item's image.
  const displayItem = activeItems.find(i => i.id === hoveredItemId) || activeItems[0];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Subtle fade in for the whole section (Desktop)
    gsap.matchMedia().add("(min-width: 1024px)", () => {
      gsap.fromTo(".menu-fade-up", 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: "#menu", start: "top 75%" } }
      );
    });
  }, []);

  return (
    <section id="menu" aria-label="Menu" className="bg-linen py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="menu-fade-up mb-12 lg:mb-24 text-center lg:text-left">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
            Our Menu
          </p>
          <h2 className="mt-4 font-display text-4xl italic text-espresso sm:text-6xl">
            A curated tasting experience
          </h2>
        </div>
      </div>

      {/* MOBILE: Immersive Horizontal Snap Scrolling Feed */}
      <div className="lg:hidden w-full relative">
        {/* Category Pill Scroll */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-6 pb-6 no-scrollbar">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`snap-start shrink-0 rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                  isActive ? "bg-espresso text-linen shadow-lg" : "bg-espresso/5 text-espresso/60 border border-espresso/10"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Readable Vertical Menu with Inline Image Reveal */}
        <div className="flex flex-col gap-6 px-6 pb-12">
          {activeItems.map((item) => {
            const isExpanded = hoveredItemId === item.id;
            return (
              <div 
                key={item.id} 
                onClick={() => setHoveredItemId(isExpanded ? null : item.id)}
                className="flex flex-col gap-4 border-b border-espresso/10 pb-6 transition-all duration-300"
              >
                {/* The readable text row */}
                <div className="flex justify-between items-baseline gap-4 cursor-pointer">
                  <h3 className="font-display text-2xl text-espresso">
                    {item.name}
                  </h3>
                  <span className="font-body text-base font-bold tracking-widest text-terracotta whitespace-nowrap">
                    {formatMoney(item.base_price)}
                  </span>
                </div>
                
                <p className="text-sm leading-relaxed text-espresso/70 pr-4">
                  {item.description}
                </p>

                {item.dietary_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.dietary_tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-[0.2em] text-espresso/50 border border-espresso/10 rounded-full px-2 py-0.5">
                        {DIETARY_LABEL[tag]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Unique Mobile Inline Image Expansion */}
                <div 
                  className={`relative w-full rounded-2xl overflow-hidden transition-all duration-700 ease-[var(--ease-cubic)] ${
                    isExpanded ? "h-[40vh] mt-4 opacity-100" : "h-0 mt-0 opacity-0"
                  }`}
                >
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt={item.photo_alt || item.name}
                      fill
                      sizes="90vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-charcoal flex items-center justify-center">
                      <span className="text-linen/50 italic font-display">Signature</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DESKTOP: Split-Screen Hover Experience */}
      <div className="hidden lg:grid max-w-7xl mx-auto px-6 lg:grid-cols-2 gap-24 items-start">
        {/* LEFT: Sticky Image Display */}
        <div className="menu-fade-up sticky top-32 h-[75vh] w-full rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative w-full h-full">
            {displayItem?.photo_url ? (
              <Image
                src={displayItem.photo_url}
                alt={displayItem.photo_alt || displayItem.name}
                fill
                sizes="50vw"
                className="object-cover transition-opacity duration-700 ease-[var(--ease-cubic)]"
                priority
              />
            ) : (
              <div className="w-full h-full bg-espresso/5 flex items-center justify-center">
                <span className="font-display italic text-espresso/40 text-2xl">Signature Dish</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* RIGHT: Menu Categories & Items */}
        <div className="flex flex-col">
          {/* Category Tabs */}
          <div className="menu-fade-up flex flex-wrap gap-6 border-b border-espresso/10 pb-6 mb-12">
            {categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`font-body text-sm uppercase tracking-[0.2em] transition-all duration-500 ease-out ${
                    isActive ? "text-espresso font-semibold" : "text-espresso/40 hover:text-espresso/70"
                  }`}
                >
                  {cat.name}
                  {isActive && <div className="mt-2 h-0.5 w-full bg-terracotta" />}
                </button>
              );
            })}
          </div>

          {/* Menu List */}
          <div className="flex flex-col gap-10">
            {activeItems.map((item) => (
              <div 
                key={item.id}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                className="group cursor-pointer menu-fade-up"
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-transparent transition-colors duration-500 group-hover:border-espresso/20 pb-4">
                  <h3 className="font-display text-2xl text-espresso transition-transform duration-500 group-hover:translate-x-2">
                    {item.name}
                  </h3>
                  <span className="font-body text-sm font-semibold tracking-widest text-terracotta">
                    {formatMoney(item.base_price)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-espresso/70 transition-transform duration-500 group-hover:translate-x-2">
                  {item.description}
                </p>

                {item.dietary_tags.length > 0 && (
                  <div className="mt-4 flex gap-3 transition-transform duration-500 group-hover:translate-x-2">
                    {item.dietary_tags.map((tag) => (
                      <span key={tag} className="text-[10px] uppercase tracking-[0.1em] text-espresso/50 border border-espresso/10 rounded-full px-2 py-0.5">
                        {DIETARY_LABEL[tag]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
