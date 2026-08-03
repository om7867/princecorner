import { proxyToBackend } from "@/server/backend-proxy";

/** GET /api/orders — admin: all orders (staff auth required). Guest ordering
 * and guest order-history now call the FastAPI backend directly since
 * there's no secret to protect on that path. */
export async function GET() {
  return proxyToBackend("/admin/orders");
}
