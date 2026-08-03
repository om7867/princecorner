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
  // Backend is off; use mock items directly to keep the terminal clean.
  return MOCK_MENU_ITEMS;
}

import { FloatingCartPill } from "@/components/cart/FloatingCartPill";
import { ImageMarquee } from "@/components/sections/ImageMarquee";

export default async function Home() {
  const [menuItems, settings] = await Promise.all([getMenuItems(), getSiteSettings()]);
  return (
    <>
      <LoadingScreen />
      <SideNav />
      <FloatingCartPill />
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
            imageSrc="/food-photos/punjabi_thali.jpg"
            imageAlt="Prince Special Punjabi Thali Feast"
            buttonText="Discover Our Story"
          />

          <MenuShowcase items={menuItems} />
          
          <EditorialSection 
            layout="text-right"
            tagline="The Atmosphere"
            heading="A Space Designed for Senses."
            paragraph="Step into an environment where architecture and ambiance converge. Warm lighting, tactile materials, and generous spatial design create a sanctuary for family dining."
            imageSrc="/food-photos/storefront_hero.jpg"
            imageAlt="Prince Corner Dining Ambiance"
          />

          <VenueGrid hiddenPages={settings.hidden_pages} />
          <GalleryStrip />
          
          <EditorialSection 
            layout="split"
            tagline="Family Celebrations"
            heading="Intimate Gatherings. Unforgettable Moments."
            paragraph="For family gatherings and special occasions, our spacious dining areas offer comfortable seating accompanied by rich, authentic 100% pure vegetarian thalis and tawa specialties."
            imageSrc="/food-photos/paneer_butter_masala.jpg"
            imageAlt="Authentic Paneer Butter Masala"
          />

          <Testimonials />
          <ReservationSection />
        </main>
        <LocationFooter settings={settings} />
      </SmoothScrollProvider>
    </>
  );
}
