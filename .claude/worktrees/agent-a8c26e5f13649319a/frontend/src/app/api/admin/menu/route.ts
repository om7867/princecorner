import { proxyToBackend } from "@/server/backend-proxy";

/** GET /api/admin/menu — full menu including 86'd/inactive items. */
export async function GET() {
  return proxyToBackend("/admin/menu");
}

/** POST /api/admin/menu — create a new menu item. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/admin/menu/items", { method: "POST", body });
}
