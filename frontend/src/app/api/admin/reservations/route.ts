import { proxyToBackend } from "@/server/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/reservations");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/admin/reservations", {
    method: "POST",
    body,
  });
}

