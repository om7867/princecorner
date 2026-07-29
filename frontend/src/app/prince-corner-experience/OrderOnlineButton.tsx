"use client";

import Link from "next/link";

/**
 * Persistent "Order Online" entry point for the Prince Corner experience
 * page. Fixed bottom-left so it never collides with `DotNavigation`'s
 * right-side dots or the globally fixed `SiteNavbar` (top) / `FloatingContact`
 * + `PrinceCornerBadge` (also bottom-right) from `SiteChrome`. Visible at
 * every scroll position, independent of section.
 */
export function OrderOnlineButton() {
  return (
    <Link
      href="/order?table=ONLINE&r=prince-corner-isanpur"
      className="fixed bottom-20 left-6 z-[100] rounded-full bg-[#D4AF37] px-6 py-3 font-body text-xs font-semibold uppercase tracking-[0.15em] text-[#0B0B0B] shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-transform hover:scale-105"
    >
      Order Online
    </Link>
  );
}
