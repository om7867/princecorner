import { NextResponse } from "next/server";
import { isAdmin } from "@/server/auth";
import {
  createOrder,
  getAvailableMenu,
  getTables,
  listOrders,
  type OrderLine,
} from "@/server/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders            — admin: all orders
 * GET /api/orders?table=T5   — guest: orders for their table session
 */
export async function GET(request: Request) {
  const table = new URL(request.url).searchParams.get("table");
  if (!table && !(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ orders: await listOrders(table ?? undefined) });
}

/** POST /api/orders — guest places an order from the QR menu. */
export async function POST(request: Request) {
  let body: {
    table?: string;
    lines?: { itemId: string; quantity: number }[];
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const tables = await getTables();
  const table = body.table?.trim().toUpperCase() ?? "";
  if (!tables.includes(table)) {
    return NextResponse.json(
      { ok: false, error: "Unknown table — please rescan the QR code on your table." },
      { status: 422 }
    );
  }

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Your cart is empty." },
      { status: 422 }
    );
  }

  // Server-side price lookup — never trust client prices, and reject 86'd items.
  const menu = await getAvailableMenu();
  const lines: OrderLine[] = [];
  for (const line of body.lines) {
    const item = menu.find((m) => m.id === line.itemId);
    if (!item) {
      return NextResponse.json(
        { ok: false, error: "An item in your cart just sold out. Please review your cart." },
        { status: 409 }
      );
    }
    const quantity = Math.min(Math.max(Math.floor(line.quantity), 1), 20);
    lines.push({ itemId: item.id, name: item.name, price: item.price, quantity });
  }

  const order = await createOrder({
    table,
    lines,
    note: (body.note ?? "").trim().slice(0, 300),
  });
  return NextResponse.json({ ok: true, order });
}
