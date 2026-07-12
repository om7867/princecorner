import Link from "next/link";
import { VENUES } from "@/data/venues";
import { SITE, directionsLink, telLink, whatsappLink } from "@/data/site";

export function LocationFooter() {
  return (
    <footer
      id="location"
      aria-label="Location and contact"
      className="bg-[#181210] px-6 pb-10 pt-24 text-linen"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl italic text-linen">Smaplee</p>
            <p className="mt-3 max-w-xs text-sm text-linen/60">
              Restaurant, café, bar, and bakery under one warm roof. Slow food,
              honest coffee, and a table that&apos;s yours as long as you need
              it.
            </p>
            <div className="mt-5 flex gap-3">
              {["Instagram", "Facebook", "X"].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={`Smaplee on ${social}`}
                  className="rounded-full border border-linen/20 px-4 py-1.5 font-body text-xs text-linen/70 transition-colors hover:border-saffron hover:text-saffron"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Find us */}
          <div>
            <h2 className="font-body text-xs uppercase tracking-[0.3em] text-saffron">
              Find Us
            </h2>
            <address className="mt-4 space-y-2 text-sm not-italic text-linen/70">
              <p>
                {SITE.address.street}
                <br />
                {SITE.address.area}
              </p>
              <p>
                <a href={telLink()} className="transition-colors hover:text-saffron">
                  {SITE.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="transition-colors hover:text-saffron"
                >
                  {SITE.email}
                </a>
              </p>
            </address>
            <a
              href={directionsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-saffron/50 px-5 py-2 font-body text-xs font-semibold uppercase tracking-[0.15em] text-saffron transition-colors hover:bg-saffron hover:text-espresso"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 13s4.5-4 4.5-7.3A4.5 4.5 0 002.5 5.7C2.5 9 7 13 7 13z" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="7" cy="5.8" r="1.4" stroke="currentColor" strokeWidth="1.1" />
              </svg>
              Get Directions
            </a>
          </div>

          {/* Hours */}
          <div>
            <h2 className="font-body text-xs uppercase tracking-[0.3em] text-saffron">
              Hours
            </h2>
            <dl className="mt-4 space-y-3">
              {SITE.hours.map((row) => (
                <div key={row.days}>
                  <dt className="text-sm font-medium text-linen/80">{row.days}</dt>
                  <dd className="text-sm text-linen/55">{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Rooms */}
          <div>
            <h2 className="font-body text-xs uppercase tracking-[0.3em] text-saffron">
              The Rooms
            </h2>
            <ul className="mt-4 space-y-2.5" role="list">
              {VENUES.map((venue) => (
                <li key={venue.slug}>
                  <Link
                    href={`/${venue.slug}`}
                    className="text-sm text-linen/70 transition-colors hover:text-saffron"
                  >
                    {venue.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#menu"
                  className="text-sm text-linen/70 transition-colors hover:text-saffron"
                >
                  The Menu
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-linen/10 pt-8 text-xs text-linen/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>
            Website by{" "}
            <a
              href={`mailto:${SITE.builtBy.email}?subject=${encodeURIComponent(
                "I want a website like Smaplee"
              )}`}
              className="font-semibold text-saffron/80 transition-colors hover:text-saffron"
            >
              {SITE.builtBy.name}
            </a>{" "}
            — {SITE.builtBy.note}{" "}
            <a
              href={whatsappLink("Hi Kelvion Tech! I saw the Smaplee demo and want a website for my restaurant.")}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-saffron"
            >
              Let&apos;s talk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
