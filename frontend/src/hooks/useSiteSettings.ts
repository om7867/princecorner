"use client";

import { useEffect, useState } from "react";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import type { SiteSettingsDTO } from "@/lib/types";

export function useSiteSettings(): { settings: SiteSettingsDTO | null; loaded: boolean } {
  const [settings, setSettings] = useState<SiteSettingsDTO | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${PUBLIC_API_BASE_URL}/settings`)
      .then((r) => r.json())
      .then((data: SiteSettingsDTO) => {
        if (!cancelled) setSettings(data);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loaded };
}
