import { NextResponse } from "next/server";
import { proxyToBackend } from "@/server/backend-proxy";
import { updateMockOrderStatus } from "@/server/order-store";
import type { OrderStatus } from "@/lib/types";

/** PATCH /api/orders/:id — staff advances an order's status (KDS "bump"). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const res = await proxyToBackend(`/admin/orders/${id}/status`, { method: "PATCH", body });
    if (res.ok) return res;
  } catch {
    /* ignore and fallback */
  }

  const updated = updateMockOrderStatus(id, body.status as OrderStatus);
  if (updated) {
    return NextResponse.json(updated);
  }
  return NextResponse.json({ ok: true, status: body.status });
}
