import { NextResponse } from "next/server";
import { isAdmin } from "@/server/auth";
import { updateOrderStatus, type OrderStatus } from "@/server/store";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = ["received", "preparing", "ready", "served"];

/** PATCH /api/orders/:id — staff advances an order's status (KDS "bump"). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const status = body.status as OrderStatus;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 422 });
  }

  const order = await updateOrderStatus(id, status);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order });
}
