import { proxyToBackend } from "@/server/backend-proxy";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/platform/organizations/${id}`, { method: "PATCH", body });
}
