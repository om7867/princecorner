"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
function ensureScrollTriggerRegistered() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/**
 * Tracks 0->1 scroll progress of a section without triggering React
 * re-renders every frame — the ref is read inside R3F's useFrame loop,
 * which is the only consumer that needs per-frame freshness.
 */
export function useSectionProgress(sectionRef: RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    ensureScrollTriggerRegistered();
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [sectionRef]);

  return progress;
}
