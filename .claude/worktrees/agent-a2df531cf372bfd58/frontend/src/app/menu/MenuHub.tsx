"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/types";
import type { DietaryTag, MenuItemDTO } from "@/lib/types";
import { VENUES, type VenueSlug } from "@/data/venues";
import { ChefSelectionCarousel } from "./ChefSelectionCarousel";
import { PremiumMenu } from "./PremiumMenu";

export function MenuHub({ items, siteName }: { items: MenuItemDTO[]; siteName: string }) {
  return (
    <main className="relative z-10 text-linen bg-[#0e0b08]">

      {/* The 400vh Cinematic Carousel */}
      <ChefSelectionCarousel onViewFull={() => {
        // When clicking View Full Menu, scroll down to the Premium Menu
        window.scrollBy({ top: window.innerHeight * 4, behavior: "smooth" });
      }} />

      {/* The Premium Full Menu */}
      <PremiumMenu items={items} />

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
