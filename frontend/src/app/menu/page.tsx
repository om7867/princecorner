import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/env";
import { getSiteSettings } from "@/lib/site-settings";
import type { MenuItemDTO } from "@/lib/types";
import { WorldCanvas } from "@/scenes/core/WorldCanvas";
import { MenuHubWorld, MENU_KEYFRAMES } from "@/scenes/worlds/MenuHubWorld";
import { MenuHub } from "./MenuHub";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "The Menu",
    description: `Every plate, pour, and pastry across all four ${settings.name} rooms — in one place.`,
  };
}

export const dynamic = "force-dynamic";

async function getMenuItems(): Promise<MenuItemDTO[]> {
  const res = await fetch(`${API_BASE_URL}/menu`, { next: { revalidate: 10 } });
  return res.ok ? res.json() : [];
}

export default async function MenuHubPage() {
  const [items, settings] = await Promise.all([getMenuItems(), getSiteSettings()]);

  return (
    <>
      <WorldCanvas
        keyframes={MENU_KEYFRAMES}
        backdrop="bg-gradient-to-b from-[#1c1610] via-[#14100b] to-[#0e0b08]"
      >
        <MenuHubWorld />
      </WorldCanvas>
      <MenuHub items={items} siteName={settings.name} />
    </>
  );
}
