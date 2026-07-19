import { Hero } from "@/components/sections/Hero";
import { HighlightsBand } from "@/components/sections/HighlightsBand";
import { MenuShowcase } from "@/components/sections/MenuShowcase";
import { API_BASE_URL } from "@/lib/env";
import { getSiteSettings } from "@/lib/site-settings";
import type { MenuItemDTO } from "@/lib/types";
import { VenueGrid } from "@/components/sections/VenueGrid";
import { OurStory } from "@/components/sections/OurStory";
import { GalleryStrip } from "@/components/sections/GalleryStrip";
import { Testimonials } from "@/components/sections/Testimonials";
import { ReservationSection } from "@/components/sections/ReservationSection";
import { LocationFooter } from "@/components/sections/LocationFooter";
import { SideNav } from "@/components/ui/SideNav";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export const dynamic = "force-dynamic";

async function getMenuItems(): Promise<MenuItemDTO[]> {
  const res = await fetch(`${API_BASE_URL}/menu`, { next: { revalidate: 10 } });
  return res.ok ? res.json() : [];
}

export default async function Home() {
  const [menuItems, settings] = await Promise.all([getMenuItems(), getSiteSettings()]);
  return (
    <>
      <LoadingScreen />
      <SideNav />
      <main>
        <Hero siteName={settings.name} />
        <HighlightsBand />
        <MenuShowcase items={menuItems} />
        <VenueGrid />
        <OurStory siteName={settings.name} />
        <GalleryStrip />
        <Testimonials />
        <ReservationSection />
      </main>
      <LocationFooter settings={settings} />
    </>
  );
}
