"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CrownIcon } from "./CrownIcon";

/** Always-on entry point into the Prince Corner world — a small red/white
 * crown badge on the right edge of every page (except its own). */
export function PrinceCornerBadge() {
  const pathname = usePathname();
  if (pathname.startsWith("/prince-corner")) return null;

  return (
    <Link
      href="/prince-corner"
      aria-label="Visit Prince Corner"
      className="group fixed right-3 top-[34%] z-40 flex flex-col items-center gap-1.5 sm:right-5"
    >
      <span className="relative flex h-13 w-13 items-center justify-center" style={{ width: 52, height: 52 }}>
        <span className="absolute inset-0 rounded-full bg-prince-red/50 motion-safe:animate-ping [animation-duration:2.4s]" aria-hidden />
        <span className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-prince-red bg-white shadow-lg shadow-black/30 transition-transform duration-300 ease-[var(--ease-cubic)] group-hover:scale-110">
          <CrownIcon className="h-6 w-6 text-prince-red" />
        </span>
      </span>
      <span className="pointer-events-none rounded-full bg-prince-red px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-wider text-white shadow-sm shadow-black/20">
        Prince
      </span>
    </Link>
  );
}
