import { proxyToBackend } from "@/server/backend-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; addonId: string }> }
) {
  const { id, addonId } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/admin/menu/items/${id}/addons/${addonId}`, { method: "PATCH", body });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; addonId: string }> }
) {
  const { id, addonId } = await params;
  return proxyToBackend(`/admin/menu/items/${id}/addons/${addonId}`, { method: "DELETE" });
}
