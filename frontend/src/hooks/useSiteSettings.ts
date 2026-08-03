"use client";

import { useEffect, useState } from "react";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import type { SiteSettingsDTO } from "@/lib/types";

/**
 * `restaurantSlug` is only needed by multi-branch-aware callers (the guest
 * order flow, which reads it from the QR/online-order URL's `r` param) —
 * every other caller is the single default-tenant marketing site and omits
 * it, keeping today's behavior unchanged.
 */
export function useSiteSettings(restaurantSlug?: string): { settings: SiteSettingsDTO | null; loaded: boolean } {
  const [settings, setSettings] = useState<SiteSettingsDTO | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const url = restaurantSlug
      ? `${PUBLIC_API_BASE_URL}/settings?restaurant=${encodeURIComponent(restaurantSlug)}`
      : `${PUBLIC_API_BASE_URL}/settings`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SiteSettingsDTO | null) => {
        if (!cancelled && data) setSettings(data);
      })
      .catch(() => {
        // Backend offline or unreachable — silently fall back
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantSlug]);

  return { settings, loaded };
}
