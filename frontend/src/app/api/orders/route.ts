import { NextResponse } from "next/server";
import { proxyToBackend } from "@/server/backend-proxy";
import { getMockOrders } from "@/server/order-store";

/** GET /api/orders — admin: all orders (staff auth required). Fallback to mock store if backend is offline. */
export async function GET() {
  try {
    const res = await proxyToBackend("/admin/orders");
    if (res.ok) {
      return res;
    }
  } catch {
    /* ignore and fallback */
  }
  return NextResponse.json(getMockOrders());
}
