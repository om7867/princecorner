"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VENUES } from "@/data/venues";

type LiveSite = {
  announcement: { text: string; href: string; label: string } | null;
  presents: string;
};

const ANNOUNCEMENT_KEY = "smaplee-announcement-dismissed";

// sessionStorage read via useSyncExternalStore: SSR renders without the
// banner (server snapshot = dismissed), the client corrects after hydration.
function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const [justDismissed, setJustDismissed] = useState(false);
  const [live, setLive] = useState<LiveSite | null>(null);
  const pathname = usePathname();

  // announcement + branding are admin-editable — always read them live
  useEffect(() => {
    fetch("/api/site")
      .then((r) => r.json())
      .then((data: LiveSite) => setLive(data))
      .catch(() => {});
  }, [pathname]);

  const storedDismissed = useSyncExternalStore(
    subscribeToStorage,
    () => sessionStorage.getItem(ANNOUNCEMENT_KEY) === "1",
    () => true
  );
  const announcement = live?.announcement ?? null;
  const showAnnouncement = !!announcement && !storedDismissed && !justDismissed;

  function dismissAnnouncement() {
    sessionStorage.setItem(ANNOUNCEMENT_KEY, "1");
    setJustDismissed(true);
  }

  const links = [
    ...VENUES.map((v) => ({
      href: `/venue/${v.slug}`,
      label: v.name.replace("The ", ""),
    })),
    { href: "/#menu", label: "Menu" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {showAnnouncement && announcement && (
        <div
          role="region"
          aria-label="Announcement"
          className="relative flex items-center justify-center gap-3 bg-saffron px-10 py-2 text-center"
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="rounded-2xl bg-espresso/60 px-4 py-1.5 text-center backdrop-blur-md transition-colors hover:bg-espresso/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
        >
          {live?.presents && (
            <span className="block font-body text-[8px] uppercase tracking-[0.25em] text-saffron/90">
              {live.presents}
            </span>
          )}
          <span className="block font-display text-lg italic leading-tight text-linen">
            Smaplee
          </span>
        </Link>

        {/* Desktop links */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-full bg-espresso/60 p-1.5 backdrop-blur-md md:flex"
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors duration-300 ease-[var(--ease-cubic)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                  isActive
                    ? "bg-saffron text-espresso"
                    : "text-linen/85 hover:bg-linen/10 hover:text-linen"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/#reservation"
            className="ml-1 rounded-full bg-terracotta px-4 py-1.5 font-body text-sm font-semibold text-linen transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            Reserve
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

      {/* Mobile slide-down panel */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="mx-5 rounded-2xl bg-espresso/90 p-3 backdrop-blur-lg md:hidden"
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
                href="/#reservation"
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
