import { proxyToBackend } from "@/server/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/org/branding");
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/admin/org/branding", { method: "PATCH", body });
}
