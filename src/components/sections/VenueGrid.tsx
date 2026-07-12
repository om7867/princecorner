import Image from "next/image";
import Link from "next/link";
import { VENUES } from "@/data/venues";

export function VenueGrid() {
  return (
    <section
      id="spaces"
      aria-label="Our spaces"
      className="bg-linen-soft px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
            Four Rooms, One Table
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl italic text-espresso sm:text-5xl">
            Explore our spaces
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-espresso/70">
            Restaurant, café, bar, and bakery — each with its own light, its
            own pace, and its own 3D story. Step inside.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {VENUES.map((venue) => (
            <li key={venue.slug}>
              <Link
                href={`/venue/${venue.slug}`}
                className="group block overflow-hidden rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={venue.heroPhoto.src}
                    alt={venue.heroPhoto.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/20 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-2xl italic text-linen">
                      {venue.name}
                    </h3>
                    <p className="mt-1 text-sm text-linen/80">{venue.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-saffron">
                      Step inside
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                        className="transition-transform duration-300 ease-[var(--ease-cubic)] group-hover:translate-x-1"
                      >
                        <path
                          d="M2 7H12M12 7L8 3M12 7L8 11"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
