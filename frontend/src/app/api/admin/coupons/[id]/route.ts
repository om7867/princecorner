import { proxyToBackend } from "@/server/backend-proxy";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/admin/coupons/${id}`, { method: "PATCH", body });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/admin/coupons/${id}`, { method: "DELETE" });
}

