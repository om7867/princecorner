"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Brief branded veil instead of a blank white flash on first paint.
 * Held for a minimum beat so it doesn't just strobe on fast connections,
 * then fades — never blocks longer than that, since Hero renders its own
 * gradient immediately underneath and doesn't need the veil to finish.
 */
export function LoadingScreen() {
  const { settings } = useSiteSettings();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 550);
    const removeTimer = setTimeout(() => setVisible(false), 950);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-50 flex items-center justify-center bg-espresso transition-opacity duration-500 ease-[var(--ease-cubic)] ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          className="motion-safe:animate-spin"
          style={{ animationDuration: "1.4s" }}
        >
          <path
            d="M20 4C11 4 4 11 4 20"
            stroke="#e7a73a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M36 20C36 29 29 36 20 36"
            stroke="#c1622c"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
        <span className="font-display text-sm italic tracking-wide text-linen/80">
          {settings?.name ?? ""}
        </span>
      </div>
    </div>
  );
}
