import { proxyToBackend } from "@/server/backend-proxy";

export async function POST(request: Request, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const body = await request.json().catch(() => ({}));
  return proxyToBackend(`/admin/loyalty/${encodeURIComponent(phone)}/adjust`, { method: "POST", body });
}
