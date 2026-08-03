"use client";

import Image from "next/image";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0B0B0B] px-6 py-32 text-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="/food-photos/food_20.jpg"
          alt="Prince Corner at night"
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/70 to-[#0B0B0B]/95" />
      </div>

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        <h2 className="luxury-heading font-display text-4xl italic leading-tight text-[#FFF5E4] sm:text-6xl lg:text-7xl">
          Every Meal Creates <br /> Memories.
        </h2>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/prince-corner"
            className="rounded-full bg-[#D4AF37] px-8 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-[#0B0B0B] shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-transform hover:scale-105"
          >
            Visit Today
          </Link>
          <Link
            href="/reserve"
            className="rounded-full border border-[#D4AF37]/50 px-8 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-[#FFF5E4] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Book a Table
          </Link>
          <Link
            href="/menu"
            className="rounded-full border border-[#D4AF37]/50 px-8 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-[#FFF5E4] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Order Online
          </Link>
        </div>
      </div>
    </section>
  );
}
