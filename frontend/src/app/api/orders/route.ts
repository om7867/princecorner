import { NextResponse } from "next/server";
import { proxyToBackend } from "@/server/backend-proxy";
import { createMockOrder, getMockOrders } from "@/server/order-store";

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

/** POST /api/orders — POS & admin order creation. Fallback to mock store if backend is offline. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  try {
    const res = await proxyToBackend("/orders", { method: "POST", body });
    if (res.ok) {
      return res;
    }
  } catch {
    /* ignore and fallback */
  }

  const created = createMockOrder(body);
  return NextResponse.json(created, { status: 201 });
}

