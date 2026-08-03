import { proxyToBackend } from "@/server/backend-proxy";

/** POST /api/admin/menu/categories — create a new menu category. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/admin/menu/categories", { method: "POST", body });
}
