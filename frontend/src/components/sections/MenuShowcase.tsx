"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/types";
import type { CategoryDTO, MenuItemDTO } from "@/lib/types";
import { MOCK_CATEGORIES } from "@/data/mockMenu";
import { useGlobalCart } from "@/hooks/useGlobalCart";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DIETARY_LABEL: Record<string, string> = {
  vegetarian: "Pure Veg",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  "contains-nuts": "Contains nuts",
};

export function MenuShowcase({ items: allItems }: { items: MenuItemDTO[] }) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { addItem } = useGlobalCart();

  useEffect(() => {
    setCategories(MOCK_CATEGORIES);
    setActiveCategoryId(MOCK_CATEGORIES[0]?.id ?? null);
  }, [allItems]);

  const activeItems = allItems.filter((item) => item.category_id === activeCategoryId);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(min-width: 768px)", () => {
      gsap.fromTo(
        ".menu-fade-up",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: "#menu", start: "top 80%" },
        }
      );
    });
  }, []);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section id="menu" aria-label="Menu Showcase" className="bg-[#0e0b08] py-14 sm:py-28 overflow-hidden text-linen border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="menu-fade-up mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron font-bold">
              Signature Creations
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-6xl italic text-linen">
              Taste The Prince Corner Specialties
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-linen/70 max-w-xl font-light">
              Made fresh to order on live iron tawas & tandoors with 100% genuine Amul butter & pure spices.
            </p>
          </div>

          <div className="flex items-center gap-4 self-center lg:self-auto">
            <Link
              href="/order?table=ONLINE&r=prince-corner-isanpur"
              className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 font-body text-xs uppercase tracking-widest font-bold text-espresso shadow-[0_0_20px_rgba(231,167,58,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              <span>Order Full Menu Online</span>
              <span>➔</span>
            </Link>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="menu-fade-up flex overflow-x-auto gap-2 sm:gap-3 pb-4 mb-6 sm:mb-8 no-scrollbar -mx-1 px-1">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`shrink-0 font-body text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-saffron text-espresso shadow-[0_0_18px_rgba(231,167,58,0.35)] scale-105"
                    : "bg-white/5 text-linen/70 hover:text-linen hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Dish Carousel Controls Bar */}
        <div className="menu-fade-up flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-xs text-saffron uppercase font-bold tracking-widest">
            <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
            <span>Showing {activeItems.length} Signature Specialties</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollCarousel("left")}
              aria-label="Previous dishes"
              className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-saffron hover:text-espresso hover:border-saffron flex items-center justify-center text-linen transition-all duration-300 active:scale-95"
            >
              ◀
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              aria-label="Next dishes"
              className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-saffron hover:text-espresso hover:border-saffron flex items-center justify-center text-linen transition-all duration-300 active:scale-95"
            >
              ▶
            </button>
          </div>
        </div>

        {/* DISH CAROUSEL SLIDER */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 sm:pb-8 pt-2 no-scrollbar scroll-smooth -mx-1 px-1"
        >
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="menu-fade-up snap-start shrink-0 w-[260px] sm:w-[340px] rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-[#14100b] overflow-hidden shadow-xl transition-all duration-500 hover:border-saffron/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] group flex flex-col justify-between"
            >
              {/* Dish Photo Header */}
              <div className="relative h-40 sm:h-56 w-full overflow-hidden bg-black/40">
                {item.photo_url ? (
                  <Image
                    src={item.photo_url}
                    alt={item.photo_alt || item.name}
                    fill
                    sizes="340px"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <span className="font-display italic text-linen/40 text-sm">Prince Corner Signature</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14100b] via-transparent to-transparent opacity-80" />

                {/* Price Tag Badge */}
                <div className="absolute top-4 right-4 bg-[#0e0b08]/85 border border-white/20 backdrop-blur-md rounded-full px-3 py-1 font-body text-xs font-bold text-saffron shadow-lg">
                  {formatMoney(item.base_price)}
                </div>

                {/* Pure Veg Badge */}
                {item.dietary_tags.length > 0 && (
                  <div className="absolute top-4 left-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {DIETARY_LABEL[item.dietary_tags[0]] || "Pure Veg"}
                  </div>
                )}
              </div>

              {/* Dish Info & Description */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl italic text-linen group-hover:text-saffron transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-linen/70 font-light leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-linen/50">
                    Fresh Live Preparation
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-saffron/15 hover:bg-saffron active:bg-saffron border border-saffron/40 px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-saffron hover:text-espresso active:text-espresso active:scale-95 transition-all duration-200 shadow-sm"
                  >
                    <span>+ Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LINE-WISE FULL MENU CATEGORICAL LISTING */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="menu-fade-up mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-saffron font-bold">
                Line-Wise Menu View
              </p>
              <h3 className="font-display text-2xl sm:text-3xl italic text-linen">
                All Dishes Listed Line by Line
              </h3>
            </div>

            <Link
              href="/order?table=ONLINE&r=prince-corner-isanpur"
              className="text-xs font-bold uppercase tracking-widest text-saffron hover:underline"
            >
              Open Digital Ordering Screen ➔
            </Link>
          </div>

          {/* Line-Wise Grid */}
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {activeItems.map((item) => (
              <div
                key={`line-${item.id}`}
                className="menu-fade-up group flex items-start justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#14100b]/40 hover:bg-[#14100b] hover:border-saffron/30 transition-all duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-xl text-linen group-hover:text-saffron transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-[9px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      Pure Veg
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-linen/60 font-light line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-body text-base font-bold text-saffron">
                    {formatMoney(item.base_price)}
                  </span>
                  <div className="mt-1">
                    <button
                      onClick={() => addItem(item)}
                      className="rounded-full bg-saffron/15 hover:bg-saffron border border-saffron/40 px-3 py-1 text-[10px] uppercase font-bold text-saffron hover:text-espresso transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

