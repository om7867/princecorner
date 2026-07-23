import { HighlightsBand } from "@/components/sections/HighlightsBand";
import { MenuShowcase } from "@/components/sections/MenuShowcase";
import { API_BASE_URL } from "@/lib/env";
import { getSiteSettings } from "@/lib/site-settings";
import type { MenuItemDTO } from "@/lib/types";
import { VenueGrid } from "@/components/sections/VenueGrid";
import { GalleryStrip } from "@/components/sections/GalleryStrip";
import { Testimonials } from "@/components/sections/Testimonials";
import { ReservationSection } from "@/components/sections/ReservationSection";
import { LocationFooter } from "@/components/sections/LocationFooter";
import { SideNav } from "@/components/ui/SideNav";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { EditorialSection } from "@/components/editorial/EditorialSection";

export const dynamic = "force-dynamic";

import { MOCK_MENU_ITEMS } from "@/data/mockMenu";

async function getMenuItems(): Promise<MenuItemDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/menu`, { next: { revalidate: 10 } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return MOCK_MENU_ITEMS;
}

import { ImageMarquee } from "@/components/sections/ImageMarquee";

export default async function Home() {
  const [menuItems, settings] = await Promise.all([getMenuItems(), getSiteSettings()]);
  return (
    <>
      <LoadingScreen />
      <SideNav />
      <SmoothScrollProvider>
        <main>
          <EditorialHero siteName={settings.name} />
          <HighlightsBand />
          <ImageMarquee />
          
          <EditorialSection 
            layout="text-left"
            tagline="Our Philosophy"
            heading="Elevated Vegetarian Heritage."
            paragraph="We believe that vegetarian dining is an art form. We take beloved classics and heritage recipes—from our signature street-food delicacies to rich, aromatic curries—and elevate them with premium ingredients and uncompromising attention to detail."
            imageSrc="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2070&auto=format&fit=crop"
            imageAlt="Gourmet vegetarian dish"
            buttonText="Discover Our Story"
          />

          <MenuShowcase items={menuItems} />
          
          <EditorialSection 
            layout="text-right"
            tagline="The Atmosphere"
            heading="A Space Designed for Senses."
            paragraph="Step into an environment where architecture and ambiance converge. Warm lighting, tactile materials, and generous spatial design create a sanctuary for the modern epicurean."
            imageSrc="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop"
            imageAlt="Restaurant Interior"
          />

          <VenueGrid hiddenPages={settings.hidden_pages} />
          <GalleryStrip />
          
          <EditorialSection 
            layout="split"
            tagline="Private Dining"
            heading="Intimate Gatherings. Unforgettable Moments."
            paragraph="For those seeking a more exclusive experience, our private dining rooms offer secluded elegance accompanied by bespoke, multi-course vegetarian tasting menus crafted by our executive chef."
            imageSrc="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
            imageAlt="Private Dining Room"
          />

          <Testimonials />
          <ReservationSection />
        </main>
        <LocationFooter settings={settings} />
      </SmoothScrollProvider>
    </>
  );
}
