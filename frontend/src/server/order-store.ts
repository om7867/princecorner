import type { OrderDTO, OrderStatus } from "@/lib/types";

declare global {
  var __mock_orders__: OrderDTO[] | undefined;
}

if (!globalThis.__mock_orders__) {
  globalThis.__mock_orders__ = [];
}

export function getMockOrders(table?: string): OrderDTO[] {
  const orders = globalThis.__mock_orders__ ?? [];
  if (table) {
    return orders.filter((o) => o.table_code.toUpperCase() === table.toUpperCase());
  }
  return orders;
}

export function getMockOrderById(idOrCode: string): OrderDTO | null {
  const orders = globalThis.__mock_orders__ ?? [];
  const query = idOrCode.trim().toLowerCase().replace(/^(ord-|pc-)/, "");
  if (!query) return null;

  return (
    orders.find((o) => {
      const cleanId = o.id.toLowerCase().replace(/^ord-/, "");
      const cleanCode = o.display_code.toLowerCase().replace(/^pc-/, "");
      return (
        cleanId === query ||
        cleanCode === query ||
        o.id.toLowerCase() === idOrCode.trim().toLowerCase() ||
        o.display_code.toLowerCase() === idOrCode.trim().toLowerCase() ||
        cleanId.includes(query) ||
        query.includes(cleanId)
      );
    }) ?? null
  );
}

export function createMockOrder(payload: any): OrderDTO {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const displayCode = `PC-${randomNum}`;
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const lines = Array.isArray(payload?.lines) ? payload.lines : [];
  let subtotalNum = 0;

  const items = lines.map((line: any, i: number) => {
    const unitPrice = line.unit_price ? Number(line.unit_price) : 120;
    const qty = Number(line.quantity || 1);
    const lineTotal = unitPrice * qty;
    subtotalNum += lineTotal;

    return {
      id: line.menu_item_id || `line-${i}`,
      name_snapshot: line.name || `Item ${i + 1}`,
      unit_price_snapshot: unitPrice.toFixed(2),
      quantity: qty,
      line_total: lineTotal.toFixed(2),
      addons: [],
    };
  });

  const totalStr = subtotalNum.toFixed(2);
  const newOrder: OrderDTO = {
    id: orderId,
    display_code: displayCode,
    status: "received",
    channel: payload?.channel || "online",
    note: payload?.note?.trim() || "",
    subtotal: totalStr,
    total: totalStr,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: items.length > 0 ? items : [
      {
        id: "item-default",
        name_snapshot: "Prince Special Pav Bhaji",
        unit_price_snapshot: "120.00",
        quantity: 2,
        line_total: "240.00",
        addons: [],
      }
    ],
    table_code: (payload?.table || "ONLINE").toUpperCase(),
    is_billed: false,
  };

  if (!globalThis.__mock_orders__) globalThis.__mock_orders__ = [];
  globalThis.__mock_orders__.unshift(newOrder);
  return newOrder;
}

export function updateMockOrderStatus(id: string, newStatus: OrderStatus): OrderDTO | null {
  const orders = globalThis.__mock_orders__ ?? [];
  const order = orders.find((o) => o.id === id || o.display_code === id);
  if (order) {
    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    return order;
  }
  return null;
}
