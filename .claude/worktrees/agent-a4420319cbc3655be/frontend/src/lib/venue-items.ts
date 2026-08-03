import { API_BASE_URL } from "@/lib/env";
import type { MenuItemDTO } from "@/lib/types";

/** A venue's featured dishes, live from the backend (86'd items drop out). */
export async function getVenueItems(featuredIds: string[]): Promise<MenuItemDTO[]> {
  const res = await fetch(`${API_BASE_URL}/menu`, { next: { revalidate: 10 } });
  if (!res.ok) return [];
  const menu: MenuItemDTO[] = await res.json();
  return featuredIds
    .map((id) => menu.find((m) => m.id === id))
    .filter((m): m is MenuItemDTO => !!m);
}
