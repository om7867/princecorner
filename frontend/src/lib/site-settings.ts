import { API_BASE_URL } from "@/lib/env";
import type { SiteSettingsDTO } from "@/lib/types";

const FALLBACK: SiteSettingsDTO = {
  name: "Your Restaurant Name",
  tagline: null,
  description: null,
  logo_url: null,
  favicon_url: null,
  primary_color: null,
  accent_color: null,
  address_street: null,
  address_area: null,
  address_city: null,
  maps_query: null,
  phone: null,
  whatsapp: null,
  whatsapp_greeting: null,
  email: null,
  hours: [],
  timeslots: [],
  announcement_enabled: false,
  announcement_text: null,
  announcement_href: null,
  announcement_label: null,
  tax_rate: "0",
  loyalty_points_per_currency: "1",
  loyalty_redeem_rate: "0.01",
  razorpay_enabled: false,
  razorpay_key_id: null,
};

/** Server-side fetch of the restaurant's branding/CMS settings. */
export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, { next: { revalidate: 30 } });
    if (!res.ok) return FALLBACK;
    return (await res.json()) as SiteSettingsDTO;
  } catch {
    return FALLBACK;
  }
}

export function whatsappLink(settings: SiteSettingsDTO, message?: string): string {
  const text = message ?? settings.whatsapp_greeting ?? "Hi! I'd like to book a table.";
  return `https://wa.me/${settings.whatsapp ?? ""}?text=${encodeURIComponent(text)}`;
}

export function directionsLink(settings: SiteSettingsDTO): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.maps_query ?? "")}`;
}

export function telLink(settings: SiteSettingsDTO): string {
  return `tel:${(settings.phone ?? "").replace(/[^+\d]/g, "")}`;
}

export function fullAddress(settings: SiteSettingsDTO): string {
  return [settings.address_street, settings.address_area, settings.address_city].filter(Boolean).join(", ");
}
