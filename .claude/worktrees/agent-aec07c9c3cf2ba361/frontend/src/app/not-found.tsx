import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";

export default async function NotFound() {
  const settings = await getSiteSettings();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#3d2a1a] via-[#2e1e12] to-[#221b15] px-6 text-center">
      <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
        404 — Off the Menu
      </p>
      <h1 className="mt-5 text-balance font-display text-4xl italic text-linen sm:text-6xl">
        This table doesn&apos;t exist
      </h1>
      <p className="mt-5 max-w-md text-balance text-linen/70">
        The page you&apos;re looking for was either eaten or never plated.
        Let&apos;s get you back to a table that&apos;s actually set.
      </p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold tracking-wide text-espresso transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-105"
        >
          Back to {settings.name}
        </Link>
        <Link
          href="/#menu"
          className="rounded-full border border-linen/30 px-8 py-3 font-body text-sm font-semibold tracking-wide text-linen transition-colors duration-300 hover:border-linen/70"
        >
          See the Menu
        </Link>
      </div>
    </main>
  );
}
