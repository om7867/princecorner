"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "@/lib/motion";

export function SideNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.4, 0.6] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 rounded-full bg-espresso/5 p-3 backdrop-blur-md md:flex border border-espresso/10"
    >
      {SECTIONS.map((section) => {
        const isActive = active === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Go to ${section.label}`}
            className="group relative flex h-5 w-5 items-center justify-center"
          >
            <span
              className={`rounded-full transition-all duration-700 ease-[var(--ease-cubic)] ${
                isActive
                  ? "h-3 w-3 bg-saffron shadow-[0_0_12px_rgba(231,167,58,0.5)]"
                  : "h-1.5 w-1.5 bg-espresso/30 group-hover:bg-espresso/70 group-hover:scale-125"
              }`}
            />
            <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-md bg-espresso px-3 py-1.5 text-xs font-medium tracking-wide text-linen opacity-0 shadow-lg transition-all duration-500 ease-[var(--ease-cubic)] group-hover:opacity-100 group-hover:-translate-x-1">
              {section.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
