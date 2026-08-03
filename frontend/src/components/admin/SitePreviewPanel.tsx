"use client";

import { useState } from "react";
import Image from "next/image";
import type { SiteSettingsDTO } from "@/lib/types";

type PreviewPage = "home" | "menu" | "prince-corner" | "reserve";

const PAGES: { id: PreviewPage; label: string; url: string }[] = [
  { id: "home", label: "Home", url: "/" },
  { id: "menu", label: "Menu & Order", url: "/order?table=ONLINE&r=prince-corner-isanpur" },
  { id: "prince-corner", label: "Prince's Corner", url: "/prince-corner" },
  { id: "reserve", label: "Reserve", url: "/reserve" },
];

export function SitePreviewPanel({
  form,
  announcementEnabled,
}: {
  form: SiteSettingsDTO;
  announcementEnabled: boolean;
}) {
  const [activePage, setActivePage] = useState<PreviewPage>("home");
  const [viewMode, setViewMode] = useState<"live-sync" | "iframe">("live-sync");
  const [iframeKey, setIframeKey] = useState(0);

  const primary = form.primary_color || "#e7a73a";
  const accent = form.accent_color || "#c1622c";
  const brandName = form.name || "Prince Corner";

  const currentPageObj = PAGES.find((p) => p.id === activePage) || PAGES[0];

  return (
    <div className="sticky top-6 flex flex-col gap-3">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-saffron">
            Interactive Live Preview
          </p>
          <p className="text-[11px] text-linen/50">Changes reflect instantly as you type</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-full border border-linen/10 bg-espresso/60 p-1">
          <button
            type="button"
            onClick={() => setViewMode("live-sync")}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
              viewMode === "live-sync"
                ? "bg-saffron text-espresso shadow-md"
                : "text-linen/60 hover:text-linen"
            }`}
          >
            Live Form Sync
          </button>
          <button
            type="button"
            onClick={() => setViewMode("iframe")}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
              viewMode === "iframe"
                ? "bg-saffron text-espresso shadow-md"
                : "text-linen/60 hover:text-linen"
            }`}
          >
            Live Site Frame
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-linen/10 bg-[#1c1512] p-1.5 no-scrollbar">
        {PAGES.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => setActivePage(page.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 font-body text-xs font-semibold tracking-wide transition-all ${
              activePage === page.id
                ? "bg-saffron/20 text-saffron border border-saffron/30"
                : "text-linen/60 hover:bg-linen/5 hover:text-linen"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Browser Mockup Device Container */}
      <div className="overflow-hidden rounded-3xl border border-linen/15 bg-[#0e0b08] shadow-2xl shadow-black/70">
        {/* Browser Chrome Header */}
        <div className="flex items-center justify-between border-b border-linen/10 bg-[#181210] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 truncate rounded-full bg-linen/5 px-3 py-0.5 font-mono text-[10px] text-linen/60">
              princecorner.com{currentPageObj.url}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Refresh Preview"
              onClick={() => setIframeKey((k) => k + 1)}
              className="text-linen/50 hover:text-linen text-xs"
            >
              🔄
            </button>
            <a
              href={currentPageObj.url}
              target="_blank"
              rel="noreferrer"
              title="Open full page in new tab"
              className="text-linen/50 hover:text-saffron text-xs font-bold"
            >
              ↗
            </a>
          </div>
        </div>

        {/* Live Preview Display */}
        {viewMode === "iframe" ? (
          <div className="relative h-[550px] w-full overflow-hidden bg-black">
            <iframe
              key={`${currentPageObj.url}-${iframeKey}`}
              src={currentPageObj.url}
              title={`Live Preview of ${currentPageObj.label}`}
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <div className="relative flex flex-col min-h-[520px] bg-[#0e0b08] text-linen">
            {/* Offer Banner */}
            {announcementEnabled && form.announcement_text && (
              <div
                className="px-4 py-2 text-center text-[11px] font-bold text-espresso transition-colors duration-300"
                style={{ backgroundColor: primary }}
              >
                {form.announcement_text}{" "}
                {form.announcement_label && (
                  <span className="ml-1 font-extrabold underline underline-offset-2">
                    {form.announcement_label} ➔
                  </span>
                )}
              </div>
            )}

            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#14100b]/90 px-5 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                {form.logo_url ? (
                  <div className="relative h-7 w-7 overflow-hidden rounded-full border border-saffron/40">
                    <Image src={form.logo_url} alt="Logo" fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs text-espresso"
                    style={{ backgroundColor: primary }}
                  >
                    👑
                  </div>
                )}
                <span className="font-display text-base font-bold italic text-linen">
                  {brandName}
                  <span style={{ color: primary }}>.</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-espresso shadow-sm"
                  style={{ backgroundColor: primary }}
                >
                  Order
                </span>
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-linen shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  Reserve
                </span>
              </div>
            </div>

            {/* Dynamic Page Content Preview based on Active Page Tab */}
            <div className="flex-1 p-6">
              {activePage === "home" && (
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <span
                    className="rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] border border-saffron/30"
                    style={{ color: primary, backgroundColor: `${primary}15` }}
                  >
                    🌱 100% Pure Vegetarian
                  </span>
                  <h2 className="font-display text-3xl font-bold italic text-linen leading-tight">
                    Welcome to <br />
                    <span style={{ color: primary }}>{brandName}</span>
                  </h2>
                  <p className="font-body text-xs text-linen/70 max-w-xs font-light leading-relaxed">
                    {form.tagline || "Serving Ahmedabad's Favourite Taste."}
                  </p>
                  <p className="font-body text-[11px] text-linen/50 max-w-xs line-clamp-3">
                    {form.description || "Authentic butter Pav Bhaji, golden dosas, and slow-simmered Punjabi gravies."}
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-espresso shadow-lg"
                      style={{ backgroundColor: primary }}
                    >
                      Order Online ➔
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-linen"
                    >
                      Menu 🍲
                    </button>
                  </div>
                </div>
              )}

              {activePage === "menu" && (
                <div className="space-y-4 py-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-display text-xl italic text-linen">Menu &amp; Ordering</h3>
                    <span
                      className="rounded-full px-3 py-1 text-[9px] font-bold text-espresso uppercase tracking-wider"
                      style={{ backgroundColor: primary }}
                    >
                      Table ONLINE
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {["Starters", "Punjabi", "South Indian", "Chinese"].map((c, i) => (
                      <span
                        key={c}
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          i === 0
                            ? "text-espresso"
                            : "bg-white/5 text-linen/60 border border-white/10"
                        }`}
                        style={i === 0 ? { backgroundColor: primary } : {}}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-linen">Butter Paneer Masala</p>
                        <p className="text-[10px] text-linen/60">Velvety tomato-butter gravy</p>
                      </div>
                      <span className="font-body text-xs font-bold" style={{ color: primary }}>
                        ₹220.00
                      </span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-linen">Prince Special Pav Bhaji</p>
                        <p className="text-[10px] text-linen/60">Slow-mashed with melting butter</p>
                      </div>
                      <span className="font-body text-xs font-bold" style={{ color: primary }}>
                        ₹120.00
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activePage === "prince-corner" && (
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <span className="text-3xl">👑</span>
                  <h3 className="font-display text-3xl font-bold italic text-linen">
                    Taste the <span style={{ color: primary }}>Legacy.</span>
                  </h3>
                  <p className="font-body text-xs text-linen/80 max-w-xs leading-relaxed">
                    Uncompromising flavors, everyday. From a humble stall to Gujarat&apos;s finest culinary destination.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left w-full max-w-xs space-y-1">
                    <p className="text-[10px] uppercase font-bold text-saffron">Our Outlets</p>
                    <p className="text-xs text-linen">Isanpur · Maninagar · Vastrapur · Satellite</p>
                  </div>
                </div>
              )}

              {activePage === "reserve" && (
                <div className="space-y-4 py-4 max-w-xs mx-auto">
                  <div className="text-center">
                    <h3 className="font-display text-2xl italic text-linen">Reserve a Table</h3>
                    <p className="text-xs text-linen/60 mt-1">Book your luxury dining spot</p>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-linen/50">
                      Date &amp; Time Selection
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-linen/50">
                      Party Size (2 - 8 Guests)
                    </div>
                    <button
                      type="button"
                      className="w-full rounded-full py-2.5 font-body text-xs font-bold uppercase tracking-widest text-linen shadow-lg"
                      style={{ backgroundColor: accent }}
                    >
                      Confirm Table Reservation
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between border-t border-white/10 bg-[#14100b] px-4 py-2.5 text-[10px] text-linen/50">
              <span className="truncate">{form.phone || "+91 98765 43210"}</span>
              <span className="truncate">{form.address_city || "Ahmedabad"}</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-linen/40">
        Updates as you type — click <strong className="text-saffron">&quot;Publish changes&quot;</strong> to go live on the site.
      </p>
    </div>
  );
}

