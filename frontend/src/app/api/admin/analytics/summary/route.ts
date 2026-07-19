import { proxyToBackend } from "@/server/backend-proxy";

export async function GET(request: Request) {
  const days = new URL(request.url).searchParams.get("days") ?? "30";
  return proxyToBackend(`/admin/analytics/summary?days=${encodeURIComponent(days)}`);
}
