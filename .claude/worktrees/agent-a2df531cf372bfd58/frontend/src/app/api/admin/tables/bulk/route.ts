import { proxyToBackend } from "@/server/backend-proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/admin/tables/bulk", { method: "POST", body });
}
