"use client";

import { useEffect, useState } from "react";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { TOGGLEABLE_PAGES } from "@/lib/types";
import type { SiteSettingsDTO } from "@/lib/types";

export function PagesPanel() {
  const [hiddenPages, setHiddenPages] = useState<string[] | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${PUBLIC_API_BASE_URL}/settings`)
      .then((r) => r.json())
      .then((site: SiteSettingsDTO) => setHiddenPages(site.hidden_pages ?? []))
      .catch(() => setHiddenPages([]));
  }, []);

  async function toggle(slug: string) {
    if (!hiddenPages || busySlug) return;
    const next = hiddenPages.includes(slug)
      ? hiddenPages.filter((s) => s !== slug)
      : [...hiddenPages, slug];
    setBusySlug(slug);
    const previous = hiddenPages;
    setHiddenPages(next); // optimistic
    try {
      const res = await fetch("/api/admin/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden_pages: next }),
      });
      if (!res.ok) setHiddenPages(previous);
    } catch {
      setHiddenPages(previous);
    } finally {
      setBusySlug(null);
    }
  }

  if (!hiddenPages) {
    return <div className="h-48 animate-pulse rounded-3xl bg-linen/5" aria-hidden />;
  }

  return (
    <main aria-label="Pages">
      <h1 className="font-display text-3xl italic text-linen">Pages</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Take a page live or take it down without touching code. Unlive pages
        disappear from the site&apos;s navigation, and visitors who go there
        directly see a &quot;not available right now&quot; message instead of
        the real content.
      </p>

      <div className="mt-8 max-w-2xl space-y-2">
        {TOGGLEABLE_PAGES.map((page) => {
          const isLive = !hiddenPages.includes(page.slug);
          return (
            <div
              key={page.slug}
              className="flex items-center justify-between gap-4 rounded-2xl border border-linen/10 bg-[#221913] p-4"
            >
              <div>
                <p className="font-display text-lg italic text-linen">{page.label}</p>
                <p className="text-xs text-linen/40">{page.href}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isLive}
                disabled={busySlug === page.slug}
                onClick={() => toggle(page.slug)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] transition-colors disabled:opacity-50 ${
                  isLive ? "bg-sage/15 text-sage" : "bg-red-500/15 text-red-400"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${isLive ? "bg-sage" : "bg-red-400"}`}
                />
                {isLive ? "Live" : "Unlive"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
