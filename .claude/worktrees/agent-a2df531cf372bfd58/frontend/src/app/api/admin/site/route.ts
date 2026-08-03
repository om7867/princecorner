import { proxyToBackend } from "@/server/backend-proxy";

/** PATCH /api/admin/site — edit the restaurant's identity/branding/CMS settings. */
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/settings", { method: "PATCH", body });
}
