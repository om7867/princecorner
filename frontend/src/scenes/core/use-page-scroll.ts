"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

/**
 * Whole-page scroll progress 0→1 as a ref (no re-renders) — this is the
 * timeline every world's camera path is driven by.
 */
export function usePageScrollProgress(): MutableRefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    const update = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      progress.current =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}
