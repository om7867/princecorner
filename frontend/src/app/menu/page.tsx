import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/env";
import { getSiteSettings } from "@/lib/site-settings";
import type { MenuItemDTO } from "@/lib/types";
import { PageUnavailable } from "@/components/ui/PageUnavailable";
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
  try {
    const res = await fetch(`${API_BASE_URL}/menu`, { next: { revalidate: 10 } });
    return res.ok ? res.json() : [];
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return []; // Return empty array to allow graceful degradation/mock data fallback
  }
}

export default async function MenuHubPage() {
  const [items, settings] = await Promise.all([getMenuItems(), getSiteSettings({ fresh: true })]);

  if (settings.hidden_pages.includes("menu")) {
    return <PageUnavailable siteName={settings.name} />;
  }

  return (
    <>
      <MenuHub items={items} siteName={settings.name} />
    </>
  );
}
