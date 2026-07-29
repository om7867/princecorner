"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { MENU_ISLANDS } from "./data";

export function MenuIslands() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Continuous gentle float per island, staggered so they don't move in sync.
  useEffect(() => {
    const islands = gsap.utils.toArray<HTMLElement>(".menu-island");
    const tweens = islands.map((island, i) =>
      gsap.to(island, {
        y: "+=14",
        duration: 2.2 + i * 0.3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      })
    );
    return () => tweens.forEach((t) => t.kill());
  }, []);

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, { rotateY: px * 10, rotateX: -py * 10, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
  }
  function handleLeave(e: React.MouseEvent<HTMLButtonElement>) {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
  }

  const activeIsland = MENU_ISLANDS.find((m) => m.id === expanded);

  return (
    <section ref={containerRef} className="relative w-full bg-[#0B0B0B] py-32 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37]">The Menu</p>
        <h2 className="luxury-heading mt-4 font-display text-4xl italic text-[#FFF5E4] sm:text-6xl">
          Five Worlds. <br /> One Kitchen.
        </h2>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {MENU_ISLANDS.map((island) => (
          <button
            key={island.id}
            onClick={() => setExpanded(island.id)}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="menu-island group relative flex h-64 flex-col justify-end overflow-hidden rounded-3xl border border-[#D4AF37]/20 text-left shadow-xl transition-shadow hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image src={island.img} alt={island.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 640px) 100vw, 380px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="relative z-10 p-6">
              <h3 className="font-display text-2xl italic text-[#FFF5E4]">{island.name}</h3>
              <span className="mt-1 block font-body text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                Tap to explore
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeIsland && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setExpanded(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#141210] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpanded(null)}
              aria-label="Close"
              className="absolute right-5 top-5 text-[#FFF5E4]/60 hover:text-[#FFF5E4]"
            >
              ✕
            </button>
            <h3 className="font-display text-3xl italic text-[#D4AF37]">{activeIsland.name}</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {activeIsland.items.map((item) => (
                <li key={item} className="flex items-center justify-between border-b border-[#FFF5E4]/10 pb-3 font-body text-[#FFF5E4]/85">
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/order?table=ONLINE&r=prince-corner-isanpur"
              className="mt-6 block w-full rounded-full bg-[#D4AF37] py-3 text-center font-body text-sm font-semibold uppercase tracking-[0.15em] text-[#0B0B0B] transition-transform hover:scale-[1.02]"
            >
              Order Online
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
