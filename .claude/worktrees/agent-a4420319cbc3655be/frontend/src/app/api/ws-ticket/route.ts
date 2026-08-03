import { proxyToBackend } from "@/server/backend-proxy";

/** Mints a one-time WebSocket ticket — browsers can't send Authorization
 * headers or httpOnly cookies on a cross-origin WS handshake, so staff
 * clients fetch a short-lived ticket here first. */
export async function GET() {
  return proxyToBackend("/realtime/ticket", { method: "POST", body: {} });
}
