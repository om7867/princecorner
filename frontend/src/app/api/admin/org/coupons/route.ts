import { proxyToBackend } from "@/server/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/org/coupons");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/admin/org/coupons", { method: "POST", body });
}
