"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/types";

const CATEGORIES = [
  {
    id: "pav-bhaji",
    title: "Pav Bhaji",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=2000&auto=format&fit=crop", 
    items: [
      { name: "Pav Bhaji", price: 1200 },
      { name: "Cheese Pav Bhaji", price: 1500 },
      { name: "Jain Pav Bhaji", price: 1300 },
      { name: "Masala Pav", price: 800 },
      { name: "Tomato Cheese Pav Bhaji", price: 1600 }
    ]
  },
  {
    id: "soups",
    title: "Special Soup",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2000&auto=format&fit=crop",
    items: [
      { name: "Tomato Soup", price: 900 },
      { name: "Veg. Manchow Soup", price: 1100 },
      { name: "Sweet Corn Soup", price: 1100 },
      { name: "Cream of Mushroom Soup", price: 1200 },
      { name: "Tom Yum Soup", price: 1400 }
    ]
  },
  {
    id: "hot-drinks",
    title: "Hot Drinks",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop",
    items: [
      { name: "Tea", price: 400 },
      { name: "Coffee", price: 500 },
      { name: "Nescafe", price: 600 },
      { name: "Hot Chocolate", price: 800 }
    ]
  },
  {
    id: "fondue",
    title: "Fondue",
    image: "https://images.unsplash.com/photo-1549468057-5b7fa1a41d7a?q=80&w=2000&auto=format&fit=crop",
    items: [
      { name: "Chocolate Fondue", price: 2200 },
      { name: "Pav Bhaji Fondue", price: 2500 }
    ]
  }
];

export function ChefSelectionCarousel({ onViewFull }: { onViewFull: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far down the section we have scrolled (0 to 1)
      // We start when the top of the section hits the top of the viewport
      const scrollableDistance = height - viewportHeight;
      const scrolled = -top;
      
      let progress = scrolled / scrollableDistance;
      progress = Math.max(0, Math.min(1, progress));
      setScrollProgress(progress);
      
      // Map progress to active index (e.g., 0-0.25 is index 0)
      const newIndex = Math.min(
        Math.floor(progress * CATEGORIES.length),
        CATEGORIES.length - 1
      );
      
      setActiveIndex(newIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      aria-label="Chef's Selection Carousel" 
      // 400vh gives us 4 screens of scrolling distance to scrub through the 4 categories
      className="relative w-full bg-transparent h-[400vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0e0b08] flex items-center justify-center">
        
        {/* Cinematic Background Video from Internet */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="h-full w-full object-cover opacity-30"
            src="https://assets.mixkit.co/videos/preview/mixkit-preparing-a-meal-in-a-fine-dining-restaurant-4346-large.mp4"
          />
          {/* Gradients to blend the video into the dark UI */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08] via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0e0b08_100%)] opacity-80" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 w-full max-w-7xl px-6 h-full flex flex-col justify-center py-20">
          <div className="text-center mb-8 sm:mb-16">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron mb-4">
              Chef&apos;s Signature Series
            </p>
            <h2 className="font-display text-4xl italic text-linen sm:text-5xl">
              Curated Perfection
            </h2>
          </div>

          <div className="relative aspect-[4/5] sm:aspect-[21/9] w-full overflow-hidden rounded-3xl border border-linen/10 bg-[#14100b]/50 shadow-2xl shadow-black backdrop-blur-sm">
            {CATEGORIES.map((category, index) => {
              const isActive = index === activeIndex;
              const isPrev = index < activeIndex;
              
              return (
                <div
                  key={category.id}
                  className={`absolute inset-0 flex flex-col sm:flex-row transition-all duration-1000 ease-[var(--ease-cubic)] ${
                    isActive
                      ? "opacity-100 z-20 translate-y-0"
                      : isPrev
                      ? "opacity-0 z-10 -translate-y-8 scale-95"
                      : "opacity-0 z-10 translate-y-8 scale-105"
                  }`}
                >
                  {/* Category Image */}
                  <div className="relative flex-1 sm:flex-[1.5] h-1/2 sm:h-full overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className={`object-cover transition-transform duration-[10000ms] ease-linear ${
                        isActive ? "scale-110" : "scale-100"
                      }`}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      priority={index === 0}
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14100b] via-[#14100b]/40 to-black/30 sm:bg-gradient-to-r sm:from-black/30 sm:via-[#14100b]/40 sm:to-[#14100b]/90" />
                  </div>

                  {/* Menu Items Info Box */}
                  <div className="flex-1 flex flex-col justify-center px-6 pb-6 sm:p-12 relative z-10 bg-gradient-to-t from-[#14100b] via-[#14100b] to-transparent sm:bg-none -mt-20 sm:mt-0 pt-20 sm:pt-12">
                    <h3 className={`font-display text-5xl sm:text-6xl italic text-linen mb-6 sm:mb-8 transition-transform duration-700 delay-300 drop-shadow-lg ${isActive ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                      {category.title}
                    </h3>

                    <ul className="space-y-3 sm:space-y-4 w-full">
                      {category.items.map((item, itemIndex) => (
                        <li 
                          key={item.name} 
                          className={`flex items-end gap-3 sm:gap-4 transition-all duration-500 w-full`}
                          style={{ 
                            transitionDelay: isActive ? `${500 + itemIndex * 100}ms` : '0ms',
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'translateY(0)' : 'translateY(10px)'
                          }}
                        >
                          <span className="font-display text-lg sm:text-xl text-linen/90 whitespace-nowrap">{item.name}</span>
                          {/* Premium Menu Dotted Leader */}
                          <div className="flex-grow border-b-2 border-dotted border-white/10 mb-[6px] sm:mb-[8px]" />
                          <span className="font-body text-sm sm:text-base font-medium text-saffron tracking-widest whitespace-nowrap">
                            {formatMoney(item.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-8">
                      <button 
                        onClick={onViewFull}
                        className="text-xs uppercase tracking-widest text-white/50 cursor-pointer hover:text-saffron transition-colors"
                      >
                        View Full Menu
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Continuous Progress Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {CATEGORIES.map((_, index) => {
              const sectionSize = 1 / CATEGORIES.length;
              const sectionStart = index * sectionSize;
              const sectionEnd = (index + 1) * sectionSize;
              
              let fillPercent = 0;
              if (scrollProgress >= sectionEnd) fillPercent = 100;
              else if (scrollProgress > sectionStart) {
                fillPercent = ((scrollProgress - sectionStart) / sectionSize) * 100;
              }

              return (
                <div
                  key={index}
                  className="group relative h-1.5 w-12 sm:w-16 overflow-hidden rounded-full bg-white/20"
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-saffron"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Prominent Center Scroll Hint */}
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 opacity-90 animate-bounce pointer-events-none">
            <div className="bg-[#0e0b08]/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <span className="font-body text-[10px] uppercase tracking-[0.4em] text-saffron font-bold">Keep Scrolling</span>
              <div className="w-[2px] h-6 bg-saffron rounded-full" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
