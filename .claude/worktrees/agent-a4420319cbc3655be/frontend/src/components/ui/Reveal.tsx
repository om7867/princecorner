"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-entrance wrapper: adds `.is-visible` the first time the element
 * approaches the viewport, letting the CSS in globals.css run the actual
 * animation. One IntersectionObserver per instance, disconnected after it
 * fires — nothing lives on past its single job.
 *
 * `stagger` expects to wrap a single list/grid element and cascades that
 * element's children instead of moving the whole block.
 */
export function Reveal({
  children,
  stagger = false,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  stagger?: boolean;
  /** Extra ms before the entrance starts — for beats inside the same view. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      // Fire slightly before the element fully enters, so the motion is
      // already underway as the reader's eye arrives.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${stagger ? "reveal-stagger" : "reveal"} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
