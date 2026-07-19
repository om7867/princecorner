import { proxyToBackend } from "@/server/backend-proxy";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  const { id, ingredientId } = await params;
  return proxyToBackend(`/admin/menu/items/${id}/recipe/${ingredientId}`, { method: "DELETE" });
}
