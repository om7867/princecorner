"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_WS_BASE_URL } from "@/lib/env";
import { formatMoney } from "@/lib/types";
import type { OrderDTO, OrderStatus } from "@/lib/types";
import { POSModal } from "./POSModal";
import { ThermalBillModal } from "./ThermalBillModal";

const COLUMNS: { id: OrderStatus; label: string; action?: string; next?: OrderStatus }[] = [
  { id: "received", label: "New", action: "Start preparing", next: "preparing" },
  { id: "preparing", label: "Preparing", action: "Mark ready", next: "ready" },
  { id: "ready", label: "Ready to serve", action: "Mark served", next: "served" },
  { id: "served", label: "Served" },
];

type ChannelFilter = "all" | "dine_in" | "online";

const CHANNEL_FILTERS: { id: ChannelFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "dine_in", label: "Dine-in" },
  { id: "online", label: "Online" },
];

function minutesAgo(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

/** Ticket urgency: fresh → amber → red, mirroring KDS aging conventions. */
function ageClasses(status: OrderStatus, mins: number): string {
  if (status === "served") return "border-linen/10";
  if (mins >= 15) return "border-red-500/70";
  if (mins >= 8) return "border-saffron/70";
  return "border-sage/50";
}

export function OrdersBoard({ heading = "Live orders" }: { heading?: string }) {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [, forceTick] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const closedByUsRef = useRef(false);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));

    const tick = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    closedByUsRef.current = false;

    async function connect() {
      const res = await fetch("/api/ws-ticket").catch(() => null);
      if (!res || !res.ok) {
        scheduleReconnect();
        return;
      }
      const { ticket } = await res.json();
      const ws = new WebSocket(`${PUBLIC_WS_BASE_URL}/ws/orders?ticket=${ticket}`);
      wsRef.current = ws;

      ws.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          if (event.type === "order.created" || event.type === "order.updated") {
            const order: OrderDTO = event.order;
            setOrders((prev) => {
              const rest = prev.filter((o) => o.id !== order.id);
              return [order, ...rest];
            });
          }
        } catch {
          /* ignore */
        }
      };
      ws.onopen = () => {
        retryRef.current = 0;
      };
      ws.onclose = () => {
        if (!closedByUsRef.current) scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      const delay = Math.min(1000 * 2 ** retryRef.current, 15000);
      retryRef.current += 1;
      setTimeout(connect, delay);
    }

    connect();
    return () => {
      closedByUsRef.current = true;
      wsRef.current?.close();
    };
  }, []);

  async function advance(order: OrderDTO, next: OrderStatus) {
    // optimistic — the WebSocket push will confirm
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => {});
  }

  async function cancelOrder(order: OrderDTO) {
    if (!window.confirm(`Cancel order ${order.display_code}? This can't be undone.`)) return;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o)));
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    }).catch(() => {});
  }

  const activeCount = orders.filter((o) => o.status !== "served" && o.status !== "cancelled").length;
  const [posOpen, setPosOpen] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<OrderDTO | null>(null);

  function reloadOrders() {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {});
  }

  return (
    <main aria-label={heading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl italic text-linen">{heading}</h1>
          <p className="mt-1 text-sm text-linen/50">
            Orders from table QR codes appear here instantly — no refresh needed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPosOpen(true)}
            className="flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wider text-espresso shadow-lg transition-transform hover:scale-105"
          >
            🖥️ Open POS Terminal
          </button>
          <span className="rounded-full bg-saffron/15 px-4 py-2 font-body text-sm font-semibold text-saffron">
            {activeCount} active
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHANNEL_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setChannelFilter(f.id)}
            className={`rounded-full px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
              channelFilter === f.id ? "bg-saffron text-espresso" : "bg-linen/10 text-linen/70 hover:bg-linen/15"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loaded && orders.length === 0 && (
        <div className="mt-16 rounded-3xl border border-dashed border-linen/15 p-12 text-center">
          <p className="font-display text-xl italic text-linen/70">No orders yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-linen/40">
            Open the POS terminal to place a walk-in order or scan a table QR code.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnOrders = orders.filter(
            (o) => o.status === column.id && (channelFilter === "all" || o.channel === channelFilter)
          );
          return (
            <section key={column.id} aria-label={column.label}>
              <h2 className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.2em] text-linen/50">
                {column.label} <span className="text-linen/30">({columnOrders.length})</span>
              </h2>
              <div className="space-y-3">
                {columnOrders.map((order) => {
                  const mins = minutesAgo(order.created_at);
                  return (
                    <article
                      key={order.id}
                      className={`rounded-2xl border-2 bg-[#221913] p-4 ${ageClasses(order.status, mins)}`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        {order.channel === "online" ? (
                          <span className="rounded-full bg-saffron/15 px-2.5 py-1 font-body text-xs font-semibold uppercase tracking-[0.1em] text-saffron">
                            🛵 Online
                          </span>
                        ) : (
                          <span className="rounded-lg bg-saffron px-2.5 py-1 font-display text-lg text-espresso">
                            🍽️ {order.table_code}
                          </span>
                        )}
                        <span className="text-xs text-linen/40">
                          {mins === 0 ? "just now" : `${mins} min`}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1.5" role="list">
                        {order.items.map((line) => (
                          <li key={line.id} className="flex justify-between gap-2 text-sm">
                            <span className="text-linen">
                              <span className="font-semibold text-saffron">{line.quantity}×</span>{" "}
                              {line.name_snapshot}
                            </span>
                            <span className="text-linen/50">{formatMoney(line.line_total)}</span>
                          </li>
                        ))}
                      </ul>
                      {order.note && (
                        <p className="mt-2 rounded-lg bg-linen/5 px-2.5 py-1.5 text-xs italic text-linen/70">
                          “{order.note}”
                        </p>
                      )}
                      <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-linen/30">
                        {order.display_code} · {formatMoney(order.total)}
                      </p>
                      
                      <div className="mt-3 space-y-1.5">
                        {column.action && column.next && (
                          <button
                            onClick={() => advance(order, column.next!)}
                            className="w-full rounded-full bg-saffron py-2.5 font-body text-sm font-semibold text-espresso transition-transform active:scale-[0.98]"
                          >
                            {column.action}
                          </button>
                        )}
                        
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForBill(order)}
                            className="rounded-full border border-linen/20 py-2 font-body text-[11px] font-semibold uppercase tracking-wider text-linen transition-colors hover:border-saffron hover:text-saffron flex items-center justify-center gap-1"
                          >
                            🖨️ Print Bill
                          </button>
                          <button
                            onClick={() => setSelectedOrderForBill(order)}
                            className="rounded-full border border-emerald-500/40 bg-emerald-950/30 py-2 font-body text-[11px] font-semibold uppercase tracking-wider text-emerald-400 transition-colors hover:border-emerald-500 hover:bg-emerald-900/50 flex items-center justify-center gap-1"
                          >
                            📱 WhatsApp E-Bill
                          </button>
                        </div>

                        {column.id !== "served" && (
                          <button
                            onClick={() => cancelOrder(order)}
                            className="w-full rounded-full border border-red-500/30 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-red-400/80 transition-colors hover:border-red-500/60 hover:text-red-400"
                          >
                            Cancel order
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {posOpen && (
        <POSModal
          onClose={() => setPosOpen(false)}
          onOrderCreated={reloadOrders}
        />
      )}

      {selectedOrderForBill && (
        <ThermalBillModal
          billData={{
            displayCode: selectedOrderForBill.display_code,
            tableCode: selectedOrderForBill.table_code,
            channel: selectedOrderForBill.channel === "dine_in" ? "Dine-In" : "Takeaway / Online",
            createdAt: selectedOrderForBill.created_at,
            cashierName: "Head Cashier",
            items: selectedOrderForBill.items.map((i) => ({
              name: i.name_snapshot,
              quantity: i.quantity,
              unitPrice: i.unit_price_snapshot,
              lineTotal: i.line_total,
            })),
            subtotal: selectedOrderForBill.total,
            taxAmount: Number(selectedOrderForBill.total) * 0.05,
            total: Number(selectedOrderForBill.total) * 1.05,
            paymentMethod: "CASH",
          }}
          onClose={() => setSelectedOrderForBill(null)}
        />
      )}
    </main>
  );
}
