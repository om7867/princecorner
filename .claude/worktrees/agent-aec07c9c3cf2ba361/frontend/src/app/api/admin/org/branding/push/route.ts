import { proxyToBackend } from "@/server/backend-proxy";

export async function POST() {
  return proxyToBackend("/admin/org/branding/push", { method: "POST" });
}
