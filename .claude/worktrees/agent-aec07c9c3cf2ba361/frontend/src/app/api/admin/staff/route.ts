import { proxyToBackend } from "@/server/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/staff");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/admin/staff", { method: "POST", body });
}
