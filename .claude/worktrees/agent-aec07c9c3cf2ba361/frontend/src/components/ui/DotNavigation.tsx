"use client";

import React, { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

interface DotNavigationProps {
  sections: Section[];
}

export function DotNavigation({ sections }: DotNavigationProps) {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.1,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Smooth scroll via window to trigger Lenis correctly if installed
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col items-center gap-4 py-8 px-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center justify-center p-2"
            aria-label={`Scroll to ${section.label}`}
          >
            {/* The Dot */}
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isActive ? "bg-[#eab308] scale-150 shadow-[0_0_10px_#eab308]" : "bg-white/30 group-hover:bg-white/60"
              }`} 
            />
            
            {/* The Tooltip (Label) */}
            <span 
              className={`absolute right-10 whitespace-nowrap bg-black/80 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md pointer-events-none transition-all duration-300 ${
                isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
              }`}
            >
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
