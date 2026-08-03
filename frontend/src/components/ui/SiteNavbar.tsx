"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import type { SiteSettingsDTO } from "@/lib/types";

const ANNOUNCEMENT_KEY = "announcement-dismissed";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const [venuesOpen, setVenuesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [justDismissed, setJustDismissed] = useState(false);
  const [live, setLive] = useState<SiteSettingsDTO | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch(`${PUBLIC_API_BASE_URL}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SiteSettingsDTO | null) => {
        if (data) setLive(data);
      })
      .catch(() => {});
  }, [pathname]);

  const storedDismissed = useSyncExternalStore(
    subscribeToStorage,
    () => sessionStorage.getItem(ANNOUNCEMENT_KEY) === "1",
    () => true
  );
  const announcement =
    live?.announcement_enabled && live.announcement_text
      ? { text: live.announcement_text, href: live.announcement_href ?? "/order?table=ONLINE&r=prince-corner-isanpur", label: live.announcement_label ?? "Order Now ➔" }
      : { text: "🚀 Taste Ahmedabad's Favorite Street Food & Punjabi Delicacies — Delivering Hot & Fresh!", href: "/order?table=ONLINE&r=prince-corner-isanpur", label: "Order Online ➔" };
  const showAnnouncement = !storedDismissed && !justDismissed;

  function dismissAnnouncement() {
    sessionStorage.setItem(ANNOUNCEMENT_KEY, "1");
    setJustDismissed(true);
  }

  const hidden = live?.hidden_pages ?? [];
  const brandName = live?.name && live.name !== "kelviontech" ? live.name : "Prince Corner";

  // Available concept pages filtered by Admin > Pages hidden_pages status
  const conceptPages = [
    { slug: "prince-corner", href: "/prince-corner", label: "Prince's Corner" },
    { slug: "restaurant", href: "/restaurant", label: "The Restaurant" },
    { slug: "cafe", href: "/cafe", label: "The Café" },
    { slug: "bar", href: "/bar", label: "The Bar" },
    { slug: "bakery", href: "/bakery", label: "The Bakery" },
  ].filter((p) => !hidden.includes(p.slug));

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-[#0e0b08]/95 via-[#0e0b08]/80 to-transparent backdrop-blur-md border-b border-white/5">
      {showAnnouncement && (
        <div
          role="region"
          aria-label="Announcement"
          className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#b71c1c] via-[#d4af37] to-[#b71c1c] px-10 py-1.5 text-center shadow-lg"
        >
          <p className="font-body text-xs font-semibold text-espresso tracking-wide">
            {announcement.text}{" "}
            <Link
              href={announcement.href}
              className="ml-1 inline-flex items-center gap-1 rounded-full bg-espresso/90 px-3 py-0.5 text-xs font-bold text-saffron transition-transform hover:scale-105"
            >
              {announcement.label}
            </Link>
          </p>
          <button
            type="button"
            onClick={dismissAnnouncement}
            aria-label="Dismiss announcement"
            className="absolute right-3 rounded-full p-1 text-espresso/80 transition-colors hover:text-espresso"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6 py-2.5">
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? "max-w-5xl rounded-full bg-[#14100b]/90 px-4 py-2 shadow-2xl border border-white/10"
              : "max-w-7xl py-1"
          }`}
        >
          {/* Logo / Brand */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-2.5 rounded-2xl px-3 py-1.5 transition-all duration-300 focus-visible:outline focus-visible:outline-saffron"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-saffron/40 shadow-inner">
              <Image
                src="/princelogo.png"
                alt="Prince Corner Logo"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="block font-display text-xl font-bold tracking-tight text-linen group-hover:text-saffron transition-colors">
              {brandName}
            </span>
          </Link>

          {/* Desktop Navigation & Mode Switcher */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-2 md:flex"
          >
            {/* Primary Order Link */}
            <Link
              href="/order?table=ONLINE&r=prince-corner-isanpur"
              className={`rounded-full px-4 py-1.5 font-body text-xs uppercase tracking-widest font-semibold transition-all ${
                pathname.startsWith("/order")
                  ? "bg-saffron text-espresso shadow-[0_0_12px_rgba(231,167,58,0.4)]"
                  : "text-linen/85 hover:bg-white/10 hover:text-linen"
              }`}
            >
              Menu &amp; Order
            </Link>

            {/* Concept Rooms & Pages Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setVenuesOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-body text-xs uppercase tracking-widest font-semibold text-linen/90 transition-all hover:bg-white/10 hover:border-saffron/40"
              >
                <span>Explore Concepts ▾</span>
              </button>

              {venuesOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#14100b] p-2 shadow-2xl backdrop-blur-xl"
                  onMouseLeave={() => setVenuesOpen(false)}
                >
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-saffron">
                    Live Concept Pages
                  </p>
                  {conceptPages.length > 0 ? (
                    conceptPages.map((page) => (
                      <Link
                        key={page.slug}
                        href={page.href}
                        onClick={() => setVenuesOpen(false)}
                        className={`block rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                          pathname === page.href
                            ? "bg-saffron/20 text-saffron"
                            : "text-linen/80 hover:bg-white/5 hover:text-linen"
                        }`}
                      >
                        {page.label}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-xs text-linen/40 italic">No concept pages currently live</p>
                  )}
                </div>
              )}
            </div>

            {/* Outlets Link */}
            <Link
              href="/outlets"
              className={`rounded-full px-4 py-1.5 font-body text-xs uppercase tracking-widest font-semibold transition-all ${
                pathname.startsWith("/outlets")
                  ? "bg-saffron text-espresso shadow-[0_0_12px_rgba(231,167,58,0.4)]"
                  : "text-linen/85 hover:bg-white/10 hover:text-linen"
              }`}
            >
              Outlets
            </Link>

            {/* Track Order Link */}
            <Link
              href="/track"
              className={`rounded-full px-4 py-1.5 font-body text-xs uppercase tracking-widest font-semibold transition-all ${
                pathname.startsWith("/track")
                  ? "bg-saffron text-espresso shadow-[0_0_12px_rgba(231,167,58,0.4)]"
                  : "text-linen/85 hover:bg-white/10 hover:text-linen"
              }`}
            >
              Track Order 📍
            </Link>

            {/* Quick Action CTAs */}
            <Link
              href="/order?table=ONLINE&r=prince-corner-isanpur"
              className="ml-2 rounded-full bg-saffron px-5 py-1.5 font-body text-xs uppercase tracking-widest font-bold text-espresso shadow-[0_0_15px_rgba(231,167,58,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              Order Online
            </Link>
            {!hidden.includes("reserve") && (
              <Link
                href="/reserve"
                className="rounded-full bg-[#b71c1c] px-4 py-1.5 font-body text-xs uppercase tracking-widest font-bold text-linen shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Reserve
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-linen backdrop-blur-md md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              {open ? (
                <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div id="mobile-nav" className="border-t border-white/10 bg-[#0e0b08]/95 px-6 py-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-saffron">Navigation Menu</p>
            <Link
              href="/order?table=ONLINE&r=prince-corner-isanpur"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-saffron py-3 text-center font-body text-xs font-bold uppercase tracking-widest text-espresso shadow-lg"
            >
              Order Online Now ➔
            </Link>
            <Link
              href="/track"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-saffron/30 bg-saffron/10 px-4 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-saffron hover:bg-saffron hover:text-espresso transition-colors"
            >
              📍 Track Live Order
            </Link>
            {conceptPages.map((page) => (
              <Link
                key={page.slug}
                href={page.href}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 font-body text-xs font-semibold text-linen hover:bg-white/10"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
