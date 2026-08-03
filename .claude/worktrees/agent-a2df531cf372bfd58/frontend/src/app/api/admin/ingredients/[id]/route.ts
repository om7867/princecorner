import { proxyToBackend } from "@/server/backend-proxy";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/admin/ingredients/${id}`, { method: "PATCH", body });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/admin/ingredients/${id}`, { method: "DELETE" });
}
