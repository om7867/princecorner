import { proxyToBackend } from "@/server/backend-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/admin/menu/items/${id}/variants/${variantId}`, { method: "PATCH", body });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { id, variantId } = await params;
  return proxyToBackend(`/admin/menu/items/${id}/variants/${variantId}`, { method: "DELETE" });
}
