"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteNavbar } from "@/components/ui/SiteNavbar";
import { LocationFooter } from "@/components/sections/LocationFooter";
import { ALL_11_PRINCE_BRANCHES } from "@/components/sections/VenueGrid";

const AREAS = [
  "All Areas",
  "South Ahmedabad",
  "West Ahmedabad",
  "South-West Ahmedabad",
  "East Ahmedabad",
  "North Ahmedabad",
];

export default function OutletsPage() {
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOutlets = ALL_11_PRINCE_BRANCHES.filter((outlet) => {
    const matchesArea = selectedArea === "All Areas" || outlet.area === selectedArea;
    const matchesSearch =
      outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArea && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#0e0b08] text-linen font-body selection:bg-saffron selection:text-espresso">
      <SiteNavbar />

      {/* Hero Header */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#1c140c] to-[#0e0b08]">
        <div className="mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-saffron border border-saffron/30 rounded-full px-4 py-1.5 bg-saffron/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
            <span>11 Outlets Across Ahmedabad</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl italic text-linen tracking-tight">
            Our Outlets &amp; Dining Locations
          </h1>

          <p className="mt-6 text-sm sm:text-base text-linen/70 max-w-2xl mx-auto font-light leading-relaxed">
            From our original flagship tawa counter in Isanpur to West-side dining in Satellite, Vastrapur &amp; Bopal — find your nearest Prince Corner location below.
          </p>

          {/* Search & Area Filter Bar */}
          <div className="mt-10 max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by branch name or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-xs font-semibold text-linen placeholder-linen/40 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron backdrop-blur-md"
              />
            </div>

            <div className="flex overflow-x-auto gap-2 py-1 no-scrollbar justify-center sm:justify-start">
              {AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`shrink-0 rounded-full px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedArea === area
                      ? "bg-saffron text-espresso shadow-[0_0_15px_rgba(231,167,58,0.35)]"
                      : "bg-white/5 text-linen/60 border border-white/10 hover:text-linen hover:bg-white/10"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Outlets Directory Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-saffron">
            Showing {filteredOutlets.length} Active Outlets
          </p>
          <p className="text-xs text-linen/50 font-light">
            100% Pure Veg • Authentic Live Preparation
          </p>
        </div>

        {filteredOutlets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOutlets.map((outlet, index) => (
              <div
                key={outlet.slug}
                className="group relative rounded-[2rem] border border-white/10 bg-[#14100b] overflow-hidden shadow-xl transition-all duration-500 hover:border-saffron/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col justify-between"
              >
                {/* Outlet Photo & Rating */}
                <div className="relative h-56 w-full overflow-hidden bg-black/40">
                  <Image
                    src={outlet.image}
                    alt={outlet.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14100b] via-transparent to-transparent opacity-90" />

                  {/* Rating Tag */}
                  <div className="absolute top-4 right-4 bg-[#0e0b08]/85 border border-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-linen shadow-lg">
                    {outlet.rating}
                  </div>

                  {/* HQ / Branch Badge */}
                  <div className="absolute top-4 left-4 bg-saffron/15 border border-saffron/40 text-saffron backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {outlet.isHQ ? "Flagship HQ" : `Outlet 0${index + 1}`}
                  </div>
                </div>

                {/* Outlet Content & Description */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-saffron">
                      {outlet.area}
                    </span>

                    <h3 className="mt-1 font-display text-2xl italic text-linen group-hover:text-saffron transition-colors duration-300">
                      {outlet.name}
                    </h3>

                    <p className="mt-3 text-xs text-linen/80 font-body leading-relaxed">
                      {outlet.address}
                    </p>

                    <p className="mt-2 text-xs text-linen/60 font-light italic leading-relaxed">
                      {outlet.tagline}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 pt-4 border-t border-white/10 flex flex-col gap-3">
                    <Link
                      href={`/order?table=ONLINE&r=${outlet.slug}`}
                      className="w-full inline-flex justify-center items-center gap-2 rounded-full bg-saffron py-3 text-xs font-bold uppercase tracking-widest text-espresso shadow-[0_0_15px_rgba(231,167,58,0.3)] transition-transform hover:scale-[1.02] active:scale-98"
                    >
                      <span>Order Direct Online</span>
                      <span>➔</span>
                    </Link>

                    <Link
                      href="/reserve"
                      className="w-full inline-flex justify-center items-center gap-2 rounded-full border border-white/15 bg-white/5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-linen hover:bg-white/10 transition-colors text-center"
                    >
                      <span>Book Family Table</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-white/10 rounded-3xl bg-[#14100b]/50">
            <p className="text-linen/60 font-body text-sm">No outlets match your search query.</p>
            <button
              onClick={() => {
                setSelectedArea("All Areas");
                setSearchQuery("");
              }}
              className="mt-4 text-xs font-bold uppercase tracking-widest text-saffron underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      <LocationFooter />
    </main>
  );
}
