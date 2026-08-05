import { proxyToBackend } from "@/server/backend-proxy";

export async function GET(_request: Request, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  return proxyToBackend(`/admin/loyalty/${encodeURIComponent(phone)}`);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  return proxyToBackend(`/admin/loyalty/${encodeURIComponent(phone)}`, { method: "DELETE" });
}

