"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

export function useLuxuryReveal() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Headings: Unmask upward line by line using clip-path
      const headings = document.querySelectorAll(".luxury-heading");
      headings.forEach((heading) => {
        const text = new SplitType(heading as HTMLElement, { types: "lines" });
        
        text.lines?.forEach((line) => {
          // Wrap each line so we can clip it
          const wrapper = document.createElement("div");
          wrapper.style.overflow = "visible"; // Allow clip-path to manage visibility
          wrapper.style.display = "inline-block";
          wrapper.style.verticalAlign = "top";
          line.parentNode?.insertBefore(wrapper, line);
          wrapper.appendChild(line);
          
          // Initial state for the line itself
          gsap.set(line, {
            yPercent: 100,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
          });
        });

        gsap.to(text.lines, {
          yPercent: 0,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 150%, 0% 150%)",
          duration: 1.4,
          ease: "power4.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
          },
        });
      });

      // 2. Images: Cinematic wipe (clip-path) with subtle scale and y-translation
      const images = document.querySelectorAll(".luxury-image-container");
      images.forEach((container) => {
        const img = container.querySelector("img");
        if (!img) return;

        gsap.set(container, { clipPath: "inset(100% 0 0 0)" });
        gsap.set(img, { scale: 1.05, y: 20 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
          }
        });

        tl.to(container, {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.6,
          ease: "power4.out"
        }).to(img, {
          scale: 1,
          y: 0,
          duration: 2,
          ease: "power3.out"
        }, "-=1.6");
      });

      // 3. Paragraphs and Buttons: Subtle float up
      const paragraphs = document.querySelectorAll(".luxury-paragraph");
      paragraphs.forEach((p) => {
        gsap.fromTo(p, 
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: {
              trigger: p,
              start: "top 90%",
            },
          }
        );
      });
      
      // 4. Parallax Backgrounds (Elements with data-parallax attribute)
      const parallaxElements = document.querySelectorAll("[data-parallax]");
      parallaxElements.forEach((el) => {
        const speed = el.getAttribute("data-parallax") || "0.15";
        gsap.to(el, {
          yPercent: parseFloat(speed) * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return containerRef;
}
