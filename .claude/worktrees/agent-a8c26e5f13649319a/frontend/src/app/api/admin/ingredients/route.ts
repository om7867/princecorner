import { proxyToBackend } from "@/server/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/ingredients");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/admin/ingredients", { method: "POST", body });
}
