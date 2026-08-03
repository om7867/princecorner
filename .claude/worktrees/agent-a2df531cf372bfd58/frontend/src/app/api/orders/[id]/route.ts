import { proxyToBackend } from "@/server/backend-proxy";

/** PATCH /api/orders/:id — staff advances an order's status (KDS "bump"). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/admin/orders/${id}/status`, { method: "PATCH", body });
}
