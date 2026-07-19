"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/types";
import type { DietaryTag, MenuItemDTO } from "@/lib/types";
import { VENUES, type VenueSlug } from "@/data/venues";

type VenueFilter = VenueSlug | "all";

const VENUE_TABS: { id: VenueFilter; label: string; accent: string }[] = [
  { id: "all", label: "All", accent: "#e7a73a" },
  { id: "restaurant", label: "Restaurant", accent: "#e7a73a" },
  { id: "cafe", label: "Café", accent: "#c1622c" },
  { id: "bar", label: "Bar", accent: "#6b7a4f" },
  { id: "bakery", label: "Bakery", accent: "#d9a441" },
];

const DIETARY_FILTERS: { id: DietaryTag; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "contains-nuts", label: "Contains nuts" },
];

export function MenuHub({ items, siteName }: { items: MenuItemDTO[]; siteName: string }) {
  const [venue, setVenue] = useState<VenueFilter>("all");
  const [dietary, setDietary] = useState<DietaryTag[]>([]);
  const [query, setQuery] = useState("");

  const activeTab = VENUE_TABS.find((t) => t.id === venue)!;

  const venueItemIds = useMemo(() => {
    if (venue === "all") return null;
    return new Set(VENUES.find((v) => v.slug === venue)?.featuredIds ?? []);
  }, [venue]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (venueItemIds && !venueItemIds.has(item.id)) return false;
      if (dietary.length > 0 && !dietary.every((tag) => item.dietary_tags.includes(tag)))
        return false;
      if (
        q &&
        !item.name.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [items, venueItemIds, dietary, query]);

  const picks = items.slice(0, 4);

  function toggleDietary(tag: DietaryTag) {
    setDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <main className="relative z-10 text-linen">
      {/* Hero over the orbiting 3D arrangement */}
      <section
        aria-label={`The ${siteName} menu`}
        className="relative flex min-h-[90vh] items-center"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso/30 to-transparent"
        />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-24 text-center">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
            All Four Rooms, One Book
          </p>
          <h1 className="mt-5 text-balance font-display text-5xl italic text-linen sm:text-7xl">
            The Menu
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-balance text-linen/80">
            Every plate, pour, and pastry under the {siteName} roof — filter by
            room, diet, or craving. Scroll and the table turns with you.
          </p>
        </div>
      </section>

      {/* Filters + grid */}
      <section
        aria-label="Browse the menu"
        className="bg-[#14100b]/90 px-6 py-16 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl">
          {/* venue tabs */}
          <div
            role="tablist"
            aria-label="Filter by room"
            className="flex flex-wrap justify-center gap-2"
          >
            {VENUE_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={venue === tab.id}
                onClick={() => setVenue(tab.id)}
                className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-all duration-300 ease-[var(--ease-cubic)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                  venue === tab.id
                    ? "text-espresso"
                    : "bg-linen/10 text-linen/75 hover:bg-linen/20"
                }`}
                style={venue === tab.id ? { backgroundColor: tab.accent } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* dietary pills + search */}
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap justify-center gap-2" aria-label="Dietary filters">
              {DIETARY_FILTERS.map((f) => (
                <button
                  key={f.id}
                  aria-pressed={dietary.includes(f.id)}
                  onClick={() => toggleDietary(f.id)}
                  className={`rounded-full border px-4 py-1.5 font-body text-xs font-medium transition-colors ${
                    dietary.includes(f.id)
                      ? "border-sage bg-sage/20 text-sage"
                      : "border-linen/20 text-linen/60 hover:border-linen/40"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="relative block w-full max-w-xs">
              <span className="sr-only">Search the menu</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes, flavors…"
                className="w-full rounded-full border border-linen/20 bg-espresso/40 px-5 py-2.5 font-body text-sm text-linen placeholder:text-linen/40 focus:border-saffron focus:outline-none"
              />
            </label>
          </div>

          {/* results */}
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-linen/10 bg-[#1e1712]/90 transition-transform duration-500 ease-[var(--ease-cubic)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {item.photo_url && (
                    <Image
                      src={item.photo_url}
                      alt={item.photo_alt ?? item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg text-linen">{item.name}</h3>
                    <span
                      className="shrink-0 font-body text-sm font-semibold"
                      style={{ color: activeTab.accent }}
                    >
                      {formatMoney(item.base_price)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-linen/60">{item.description}</p>
                  {item.dietary_tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.dietary_tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-sage"
                        >
                          {tag.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="col-span-full rounded-3xl border border-linen/10 p-10 text-center text-linen/60">
                Nothing matches that combination — try loosening a filter.
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* Chef's picks */}
      <section aria-label="Chef's picks" className="bg-[#181210]/90 px-6 py-20 backdrop-blur-md">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              Most Loved
            </p>
            <h2 className="mt-4 font-display text-4xl italic text-linen">
              Chef&apos;s picks across the rooms
            </h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {picks.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-linen/10 bg-[#1e1712]/90 p-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  {item.photo_url && (
                    <Image src={item.photo_url} alt={item.photo_alt ?? item.name} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base text-linen">{item.name}</p>
                  <p className="text-sm font-semibold text-saffron">{formatMoney(item.base_price)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA row */}
      <section aria-label="Next steps" className="bg-[#14100b]/95 px-6 py-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <Link
            href="/reserve"
            className="rounded-full bg-saffron px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-espresso transition-transform duration-300 hover:scale-105"
          >
            Reserve a Table
          </Link>
          <Link
            href="/order?table=T1"
            className="rounded-full border border-linen/30 px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-linen transition-colors duration-300 hover:border-linen/70"
          >
            Order at the Table
          </Link>
        </div>
      </section>
    </main>
  );
}
