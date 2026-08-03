import Link from "next/link";

/** Shown instead of a page's real content when an admin has toggled it
 * "unlive" from Admin > Pages — the guest still gets a real page, not a 404. */
export function PageUnavailable({ siteName }: { siteName: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-espresso px-6 text-center">
      <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">{siteName}</p>
      <h1 className="mt-4 font-display text-3xl italic text-linen">
        This page isn&apos;t available right now
      </h1>
      <p className="mt-3 max-w-sm text-sm text-linen/70">
        Check back soon, or explore the rest of the site in the meantime.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold text-espresso transition-transform hover:scale-105"
      >
        Back to home
      </Link>
    </main>
  );
}
