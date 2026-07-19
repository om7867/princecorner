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
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
    >
      {SECTIONS.map((section) => {
        const isActive = active === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Go to ${section.label}`}
            className="group relative flex h-4 w-4 items-center justify-center"
          >
            <span
              className={`rounded-full transition-all duration-500 ease-[var(--ease-cubic)] ${
                isActive
                  ? "h-2.5 w-2.5 bg-saffron"
                  : "h-1.5 w-1.5 bg-espresso/40 group-hover:bg-espresso/70"
              }`}
            />
            <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-sm bg-espresso px-2 py-1 text-xs text-linen opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {section.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
