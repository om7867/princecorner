import { proxyToBackend } from "@/server/backend-proxy";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/admin/payments/${id}/refund`, { method: "POST", body: {} });
}
