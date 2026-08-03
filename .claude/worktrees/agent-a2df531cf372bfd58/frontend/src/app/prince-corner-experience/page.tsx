import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { LocationFooter } from "@/components/sections/LocationFooter";
import { DotNavigation } from "@/components/ui/DotNavigation";
import { Hero } from "./Hero";
import { DishesShowcase } from "./DishesShowcase";
import { Timeline } from "./Timeline";
import { BranchesMap } from "./BranchesMap";
import { KitchenProcess } from "./KitchenProcess";
import { MenuIslands } from "./MenuIslands";
import { ReviewBubbles } from "./ReviewBubbles";
import { Gallery } from "./Gallery";
import { Stats } from "./Stats";
import { OrderingPhone } from "./OrderingPhone";
import { FinalCTA } from "./FinalCTA";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Prince Corner — The Experience",
    description:
      "A cinematic journey through Prince Corner's story — from a single tawa in Isanpur to 11+ branches across Ahmedabad.",
    alternates: { canonical: "/prince-corner-experience" },
    openGraph: {
      title: "Prince Corner — The Experience",
      description: "Every scroll reveals something magical. Every meal creates memories.",
      url: "/prince-corner-experience",
      images: [{ url: "/food-photos/storefront_hero.jpg", width: 1200, height: 800, alt: "Prince Corner storefront at night" }],
    },
  };
}

export const dynamic = "force-dynamic";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "dishes", label: "Signature Dishes" },
  { id: "story", label: "The Story" },
  { id: "branches", label: "Explore" },
  { id: "kitchen", label: "Kitchen" },
  { id: "menu", label: "Menu" },
  { id: "reviews", label: "Reviews" },
  { id: "gallery", label: "Gallery" },
  { id: "stats", label: "Stats" },
  { id: "ordering", label: "Order Online" },
  { id: "cta", label: "Visit Us" },
];

export default async function PrinceCornerExperiencePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <DotNavigation sections={sections} />
      <SmoothScrollProvider>
        <main className="bg-[#0B0B0B]">
          <div id="hero">
            <Hero />
          </div>
          <div id="dishes">
            <DishesShowcase />
          </div>
          <div id="story">
            <Timeline />
          </div>
          <div id="branches">
            <BranchesMap />
          </div>
          <div id="kitchen">
            <KitchenProcess />
          </div>
          <div id="menu">
            <MenuIslands />
          </div>
          <div id="reviews">
            <ReviewBubbles />
          </div>
          <div id="gallery">
            <Gallery />
          </div>
          <div id="stats">
            <Stats />
          </div>
          <div id="ordering">
            <OrderingPhone />
          </div>
          <div id="cta">
            <FinalCTA />
          </div>
        </main>
        <LocationFooter settings={settings} />
      </SmoothScrollProvider>
    </>
  );
}
