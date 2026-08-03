"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/types";
import type { MenuItemDTO } from "@/lib/types";

const LUXURY_CATEGORIES = [
  { id: "starters", label: "Starters", image: "https://images.unsplash.com/photo-1626804475297-41609ea004eb?q=80&w=1000&auto=format&fit=crop" },
  { id: "soup", label: "Soup", image: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000&auto=format&fit=crop" },
  { id: "main-course", label: "Main Course", image: "https://images.unsplash.com/photo-1544025162-811114215758?q=80&w=1000&auto=format&fit=crop" },
  { id: "pizza", label: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop" },
  { id: "pasta", label: "Pasta", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000&auto=format&fit=crop" },
  { id: "burger", label: "Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" },
  { id: "chinese", label: "Chinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1000&auto=format&fit=crop" },
  { id: "desserts", label: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c8a9e9cf?q=80&w=1000&auto=format&fit=crop" },
  { id: "drinks", label: "Drinks", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop" },
  { id: "special-menu", label: "Special Menu", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=1000&auto=format&fit=crop" }
];

export function PremiumMenu({ items }: { items: MenuItemDTO[] }) {
  const [activeCat, setActiveCat] = useState(LUXURY_CATEGORIES[0].id);
  const menuRef = useRef<HTMLDivElement>(null);

  // Group items by our luxury categories based on keywords
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItemDTO[]> = {};
    LUXURY_CATEGORIES.forEach(c => groups[c.id] = []);
    
    items.forEach(item => {
      const lower = item.name.toLowerCase() + " " + item.description.toLowerCase();
      let assigned = false;
      for (const cat of LUXURY_CATEGORIES) {
        if (lower.includes(cat.id.replace("-", " ")) || lower.includes(cat.label.toLowerCase())) {
          groups[cat.id].push(item);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        groups[Math.random() > 0.5 ? "starters" : "special-menu"].push(item);
      }
    });
    
    return groups;
  }, [items]);

  // Desktop & Mobile Scroll Spy Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter(e => e.isIntersecting);
      if (visibleEntries.length > 0) {
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const activeId = visibleEntries[0].target.id.replace("section-", "").replace("mobile-section-", "");
        setActiveCat(activeId);
      }
    }, { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });

    LUXURY_CATEGORIES.forEach(cat => {
      const elDesktop = document.getElementById(`section-${cat.id}`);
      const elMobile = document.getElementById(`mobile-section-${cat.id}`);
      if (elDesktop) observer.observe(elDesktop);
      if (elMobile) observer.observe(elMobile);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string, isMobile = false) => {
    setActiveCat(id);
    const prefix = isMobile ? "mobile-section-" : "section-";
    const el = document.getElementById(`${prefix}${id}`);
    if (el) {
      // Offset for sticky headers
      const yOffset = isMobile ? -140 : -40; 
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-[#0e0b08]">
      
      {/* MOBILE VIEW: Ultra-Clean, Readable, with Bottom Fixed Nav */}
      <div className="block lg:hidden relative w-full bg-[#0e0b08] pb-24">
        
        {/* Highly Readable List Content */}
        <div className="px-4 py-8 flex flex-col gap-12">
          {LUXURY_CATEGORIES.map((cat) => {
            const categoryItems = groupedItems[cat.id];
            const displayItems = categoryItems.length > 0 ? categoryItems.slice(0, 8) : [
              { name: "Signature " + cat.label, base_price: "1200", id: "1", description: "Chef's special recipe" }
            ] as any[];

            return (
              <article key={cat.id} id={`mobile-section-${cat.id}`} className="scroll-mt-8">
                <h2 className="font-display text-3xl uppercase tracking-widest text-linen mb-6 pb-4 border-b border-white/10">
                  {cat.label}
                </h2>
                
                <ul className="flex flex-col gap-8">
                  {displayItems.map((item) => (
                    <li key={item.id} className="flex gap-4 items-start">
                      {/* Elegant Thumbnail */}
                      <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-md">
                         <Image src={cat.image} alt={cat.label} fill sizes="80px" className="object-cover opacity-80 mix-blend-lighten" unoptimized />
                         <div className="absolute inset-0 bg-[#0e0b08]/30" />
                      </div>
                      
                      {/* Clear, Solid Background Text */}
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <h3 className="font-display text-xl text-linen/90">
                            {item.name}
                          </h3>
                          <span className="font-body text-base font-bold text-saffron whitespace-nowrap">
                            {formatMoney(item.base_price)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-white/50 font-body leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Fixed Bottom Category Navigation */}
        <div className="fixed bottom-0 left-0 w-full z-50 bg-[#0e0b08]/95 backdrop-blur-xl border-t border-white/10 pt-4 pb-6 px-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-2">
            {LUXURY_CATEGORIES.map((cat) => {
              const isActive = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToSection(cat.id, true)}
                  className={`snap-start shrink-0 px-6 py-3 rounded-full font-body text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive 
                      ? "bg-saffron text-[#0e0b08] font-bold shadow-xl scale-105" 
                      : "bg-white/5 text-linen/60 border border-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW: The Premium Split-Screen Floating List */}
      <div className="hidden lg:flex mx-auto max-w-[90rem] px-12 py-24 gap-12 relative z-10">
        
        {/* Left Side (30%) - Floating Vertical Navigation */}
        <div className="w-[30%] relative">
          <nav className="sticky top-32 flex flex-col gap-3">
            {LUXURY_CATEGORIES.map((cat) => {
              const isActive = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToSection(cat.id)}
                  className={`relative overflow-hidden group flex items-center px-6 py-4 rounded-2xl transition-all duration-700 border ${
                    isActive 
                      ? "bg-white/10 border-saffron/30 scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-saffron/20" 
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 scale-100"
                  }`}
                  style={{ backdropFilter: "blur(16px)" }}
                >
                  <span className={`font-display text-lg tracking-wide transition-colors duration-500 z-10 ${
                    isActive ? "text-saffron" : "text-linen/70 group-hover:text-linen"
                  }`}>
                    {cat.label}
                  </span>
                  
                  {/* Glowing Underline for Active State */}
                  <div 
                    className={`absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-saffron to-transparent transition-opacity duration-700 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  
                  {/* Active background glow */}
                  <div 
                    className={`absolute inset-0 bg-saffron/5 transition-opacity duration-700 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side (70%) - The Menu Panels */}
        <div className="w-[70%]">
          <div ref={menuRef} className="flex flex-col gap-24 transition-transform duration-500 ease-out" style={{ transformStyle: 'preserve-3d' }}>
            {LUXURY_CATEGORIES.map((cat) => {
              const categoryItems = groupedItems[cat.id];
              const displayItems = categoryItems.length > 0 ? categoryItems.slice(0, 10) : [
                { name: "Signature " + cat.label, base_price: "1200", id: "1", description: "Chef's special recipe" },
              ] as any[];

              return (
                <article 
                  key={cat.id} 
                  id={`section-${cat.id}`}
                  className="relative rounded-[2rem] border border-white/10 bg-white/[0.02] p-12 shadow-2xl overflow-hidden group"
                  style={{ backdropFilter: "blur(20px)" }}
                >
                  {/* Premium Reflections */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-12">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                      <h2 className="font-display text-4xl uppercase tracking-[0.2em] text-linen">
                        {cat.label}
                      </h2>
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                    </div>

                    <ul className="space-y-6 max-w-2xl">
                      {displayItems.map((item) => (
                        <li key={item.id} className="group/item relative">
                          <div className="flex items-baseline gap-4 transition-transform duration-300 ease-[var(--ease-cubic)] group-hover/item:translate-x-2">
                            <h3 className="font-display text-xl text-linen/90 group-hover/item:text-linen">
                              {item.name}
                            </h3>
                            <div className="flex-1 border-b border-dotted border-white/20" />
                            <span className="relative z-10 font-body text-lg font-medium text-saffron transition-all px-3 py-1 rounded-full bg-[#0e0b08]/60 border border-white/10">
                              {formatMoney(item.base_price)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-1 text-sm text-white/40 font-body max-w-xl transition-all duration-300 group-hover/item:text-white/60">
                              {item.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="absolute top-12 -right-8 w-80 h-80 pointer-events-none opacity-90 transition-opacity duration-1000 group-hover:opacity-100">
                    <div className="w-full h-full animate-[float_6s_ease-in-out_infinite]">
                      <div className="hero-floater w-full h-full relative transition-transform duration-200 ease-out drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)]">
                        <Image
                          src={cat.image}
                          alt={cat.label}
                          fill
                          className="object-cover rounded-full mix-blend-lighten"
                          sizes="320px"
                          unoptimized={true}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
    </section>
  );
}
