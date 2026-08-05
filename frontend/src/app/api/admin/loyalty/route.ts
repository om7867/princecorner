import { proxyToBackend } from "@/server/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/loyalty");
}
