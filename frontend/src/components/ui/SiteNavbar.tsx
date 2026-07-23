"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VENUES } from "@/data/venues";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import type { SiteSettingsDTO } from "@/lib/types";

const ANNOUNCEMENT_KEY = "announcement-dismissed";

// sessionStorage read via useSyncExternalStore: SSR renders without the
// banner (server snapshot = dismissed), the client corrects after hydration.
function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [justDismissed, setJustDismissed] = useState(false);
  const [live, setLive] = useState<SiteSettingsDTO | null>(null);
  const pathname = usePathname();

  // past the hero's first beat the loose pills condense into one glass
  // capsule — quieter chrome once the film is the main event
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // announcement + branding are admin-editable — always read them live
  useEffect(() => {
    fetch(`${PUBLIC_API_BASE_URL}/settings`)
      .then((r) => r.json())
      .then((data: SiteSettingsDTO) => setLive(data))
      .catch(() => {});
  }, [pathname]);

  const storedDismissed = useSyncExternalStore(
    subscribeToStorage,
    () => sessionStorage.getItem(ANNOUNCEMENT_KEY) === "1",
    () => true
  );
  const announcement =
    live?.announcement_enabled && live.announcement_text
      ? { text: live.announcement_text, href: live.announcement_href ?? "/", label: live.announcement_label ?? "See more" }
      : null;
  const showAnnouncement = !!announcement && !storedDismissed && !justDismissed;

  function dismissAnnouncement() {
    sessionStorage.setItem(ANNOUNCEMENT_KEY, "1");
    setJustDismissed(true);
  }

  // each world's accent tints the active pill — you know which room you're
  // in before its 3D scene even finishes loading
  const hiddenPages = live?.hidden_pages ?? [];
  const links = [
    ...VENUES.filter((v) => !hiddenPages.includes(v.slug)).map((v) => ({
      href: `/${v.slug}`,
      label: v.name.replace("The ", ""),
      accent: v.accent,
    })),
    ...(hiddenPages.includes("menu") ? [] : [{ href: "/menu", label: "Menu", accent: "#e7a73a" }]),
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {showAnnouncement && announcement && (
        <div
          role="region"
          aria-label="Announcement"
          className="relative flex items-center justify-center gap-3 bg-saffron/80 px-10 py-2 text-center backdrop-blur-md"
        >
          <p className="font-body text-xs font-medium text-espresso sm:text-sm">
            {announcement.text}{" "}
            <Link
              href={announcement.href}
              className="font-semibold underline underline-offset-2 hover:no-underline"
            >
              {announcement.label}
            </Link>
          </p>
          <button
            type="button"
            onClick={dismissAnnouncement}
            aria-label="Dismiss announcement"
            className="absolute right-3 rounded-full p-1 text-espresso/70 transition-colors hover:text-espresso"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      <div className="px-4 sm:px-5">
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-500 ease-[var(--ease-out-expo)] ${
            scrolled
              ? "mt-2 max-w-3xl rounded-full glass-dark px-2.5 py-1.5"
              : "max-w-6xl py-3"
          }`}
        >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className={`rounded-2xl px-4 py-1.5 text-center backdrop-blur-md transition-colors duration-500 hover:bg-espresso/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
            scrolled ? "bg-transparent" : "bg-espresso/60"
          }`}
        >
          <span className="block font-display text-lg italic leading-tight text-linen">
            {live?.name ?? ""}
            <span className="text-saffron">.</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav
          aria-label="Primary"
          className={`hidden items-center gap-1 rounded-full p-1.5 backdrop-blur-md transition-colors duration-500 md:flex ${
            scrolled ? "bg-transparent" : "bg-espresso/60"
          }`}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                style={isActive ? { backgroundColor: link.accent } : undefined}
                className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors duration-300 ease-[var(--ease-cubic)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                  isActive
                    ? "text-espresso"
                    : "text-linen/85 hover:bg-linen/10 hover:text-linen"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/reserve"
            aria-current={pathname === "/reserve" ? "page" : undefined}
            className={`btn-ticket ml-1 rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-transform duration-300 ease-[var(--ease-cubic)] [--ticket-notch:2.55rem] hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
              pathname === "/reserve"
                ? "bg-saffron text-espresso"
                : "bg-terracotta text-linen"
            }`}
          >
            Reserve
            <span aria-hidden className="ticket-stub">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso/60 text-linen backdrop-blur-md md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            {open ? (
              <path
                d="M3 3L15 15M15 3L3 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2 5H16M2 9H16M2 13H16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="glass-dark mx-5 mt-2 rounded-2xl p-3 motion-safe:animate-[fade-rise_0.35s_var(--ease-out-expo)_both] md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-body text-sm font-medium text-linen/90 transition-colors hover:bg-linen/10"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/reserve"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl bg-terracotta px-4 py-3 text-center font-body text-sm font-semibold text-linen"
              >
                Reserve a Table
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
