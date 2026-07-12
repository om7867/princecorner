import { Hero } from "@/components/sections/Hero";
import { MenuShowcase } from "@/components/sections/MenuShowcase";
import { getAvailableMenu } from "@/server/store";
import { VenueGrid } from "@/components/sections/VenueGrid";
import { OurStory } from "@/components/sections/OurStory";
import { GalleryStrip } from "@/components/sections/GalleryStrip";
import { Testimonials } from "@/components/sections/Testimonials";
import { ReservationSection } from "@/components/sections/ReservationSection";
import { LocationFooter } from "@/components/sections/LocationFooter";
import { SideNav } from "@/components/ui/SideNav";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export const dynamic = "force-dynamic";

export default async function Home() {
  const menuItems = await getAvailableMenu();
  return (
    <>
      <LoadingScreen />
      <SideNav />
      <main>
        <Hero />
        <MenuShowcase items={menuItems} />
        <VenueGrid />
        <OurStory />
        <GalleryStrip />
        <Testimonials />
        <ReservationSection />
      </main>
      <LocationFooter />
    </>
  );
}
