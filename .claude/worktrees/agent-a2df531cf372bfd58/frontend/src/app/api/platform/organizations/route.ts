import { proxyToBackend } from "@/server/backend-proxy";

export async function GET() {
  return proxyToBackend("/platform/organizations");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyToBackend("/platform/organizations", { method: "POST", body });
}
