import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { LocationFooter } from "@/components/sections/LocationFooter";
import { PrinceHero } from "./PrinceHero";
import { PrinceStickyScroll } from "./PrinceStickyScroll";
import { PrinceBranchWheel } from "./PrinceBranchWheel";
import { DotNavigation } from "@/components/ui/DotNavigation";
import Link from "next/link";

import { PageUnavailable } from "@/components/ui/PageUnavailable";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Prince Corner — Isanpurwala",
    description:
      "Prince Corner, Isanpurwala — street-food favourites, Punjabi & Chinese plates, and the dosa counter locals cross town for. Open up your happiness!",
    alternates: { canonical: "/prince-corner" },
    openGraph: {
      title: "Prince Corner — Isanpurwala",
      description: "Open up your happiness! — signature plates and the full menu from Prince Corner.",
      url: "/prince-corner",
      images: [{ url: "/food-photos/storefront_hero.jpg", width: 1200, height: 800, alt: "Prince Corner storefront at night" }],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PrinceCornerPage() {
  const settings = await getSiteSettings();
  
  if (settings.hidden_pages.includes("prince-corner")) {
    return <PageUnavailable siteName={settings.name} />;
  }

  const sections = [
    { id: "hero", label: "The Legacy" },
    { id: "menu", label: "Menu" },
    { id: "branches", label: "Footprint" },
    { id: "outro", label: "Explore" },
  ];

  return (
    <>
      <DotNavigation sections={sections} />
      <SmoothScrollProvider>
        <main className="bg-[#fdfbf7]">
          
          <div id="hero">
            <PrinceHero />
          </div>
          <div id="menu">
            <PrinceStickyScroll />
          </div>
          <div id="branches">
            <PrinceBranchWheel />
          </div>

          {/* Minimalist Outro */}
          <section id="outro" className="relative w-full bg-[#b71c1c] py-40 px-6 lg:px-12 flex flex-col items-center justify-center text-center">
            <h2 className="font-display italic text-5xl sm:text-7xl lg:text-[7rem] text-white opacity-90 leading-tight mb-12">
              "Open up your <br /> happiness."
            </h2>
            <Link 
              href="/menu"
              className="group relative overflow-hidden rounded-full bg-white px-10 py-5 transition-transform hover:scale-105 active:scale-95 shadow-2xl"
            >
              <span className="relative z-10 font-body text-sm font-bold uppercase tracking-[0.2em] text-[#b71c1c]">
                Explore The Menu
              </span>
            </Link>
          </section>

        </main>
        <LocationFooter settings={settings} />
      </SmoothScrollProvider>
    </>
  );
}
