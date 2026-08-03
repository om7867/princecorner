import { proxyToBackend } from "@/server/backend-proxy";

/** PATCH /api/admin/menu/:id — edit an item (name/description/price/86/etc). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/admin/menu/items/${id}`, { method: "PATCH", body });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/admin/menu/items/${id}`, { method: "DELETE" });
}
