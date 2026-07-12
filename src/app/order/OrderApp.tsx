"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, type MenuCategory, type MenuItem } from "@/data/menu";

type StoredMenuItem = MenuItem & { available: boolean };

type OrderStatus = "received" | "preparing" | "ready" | "served";
type OrderLine = { itemId: string; name: string; price: string; quantity: number };
type Order = {
  id: string;
  table: string;
  lines: OrderLine[];
  note: string;
  status: OrderStatus;
  createdAt: string;
};

const STATUS_STEPS: { id: OrderStatus; label: string }[] = [
  { id: "received", label: "Received" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "served", label: "Served" },
];

function priceNumber(price: string): number {
  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

export function OrderApp() {
  const params = useSearchParams();
  const table = (params.get("table") ?? "").toUpperCase();

  const [menu, setMenu] = useState<StoredMenuItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [category, setCategory] = useState<MenuCategory>("starters");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const myOrderIds = useRef<Set<string>>(new Set());

  const storageKey = `smaplee-orders-${table}`;

  const loadMenu = useCallback(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        setMenu(data.items ?? []);
        setMenuLoaded(true);
      })
      .catch(() => setMenuLoaded(true));
  }, []);

  // initial load: menu + my previous orders this session
  useEffect(() => {
    loadMenu();
    if (!table) return;
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      ids.forEach((id) => myOrderIds.current.add(id));
    } catch {
      /* ignore */
    }
    fetch(`/api/orders?table=${encodeURIComponent(table)}`)
      .then((r) => r.json())
      .then((data) => {
        const mine = (data.orders ?? []).filter((o: Order) =>
          myOrderIds.current.has(o.id)
        );
        setMyOrders(mine);
      })
      .catch(() => {});
  }, [table, storageKey, loadMenu]);

  // real-time: my order status + menu 86 updates
  useEffect(() => {
    if (!table) return;
    const source = new EventSource(
      `/api/orders/stream?table=${encodeURIComponent(table)}`
    );
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data);
        if (event.type === "order.updated" || event.type === "order.created") {
          const order: Order = event.order;
          if (!myOrderIds.current.has(order.id)) return;
          setMyOrders((prev) => {
            const rest = prev.filter((o) => o.id !== order.id);
            return [order, ...rest];
          });
        } else if (event.type === "menu.updated") {
          loadMenu();
        }
      } catch {
        /* ignore malformed */
      }
    };
    return () => source.close();
  }, [table, loadMenu]);

  const items = useMemo(
    () => menu.filter((m) => m.category === category),
    [menu, category]
  );

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = menu.find((m) => m.id === id);
          return item ? { item, qty } : null;
        })
        .filter((x): x is { item: StoredMenuItem; qty: number } => !!x && x.qty > 0),
    [cart, menu]
  );

  const cartCount = cartLines.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cartLines.reduce(
    (sum, l) => sum + priceNumber(l.item.price) * l.qty,
    0
  );

  function setQty(id: string, qty: number) {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, Math.min(20, qty)) }));
  }

  async function submitOrder() {
    if (cartLines.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          note,
          lines: cartLines.map((l) => ({ itemId: l.item.id, quantity: l.qty })),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong — please try again.");
        if (res.status === 409) loadMenu();
        return;
      }
      const order: Order = data.order;
      myOrderIds.current.add(order.id);
      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(myOrderIds.current))
      );
      setMyOrders((prev) => [order, ...prev]);
      setCart({});
      setNote("");
      setCartOpen(false);
    } catch {
      setError("Couldn't reach the kitchen — check your connection and tap again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── no/invalid table ── */
  if (!table) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-espresso px-6 text-center">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
          Smaplee Table Ordering
        </p>
        <h1 className="mt-4 font-display text-3xl italic text-linen">
          Scan the QR code on your table
        </h1>
        <p className="mt-3 max-w-sm text-sm text-linen/70">
          Each table has its own code — scanning it tells the kitchen exactly
          where to bring your food.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linen pb-32">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-espresso/10 bg-linen/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <p className="font-display text-lg italic text-espresso">Smaplee</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-espresso/50">
              Ordering at table <span className="font-semibold text-terracotta">{table}</span>
            </p>
          </div>
          <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">
            No app needed
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4">
        {/* live order trackers */}
        {myOrders.length > 0 && (
          <section aria-label="Your orders" className="mt-4 space-y-3">
            {myOrders.map((order) => {
              const stepIndex = STATUS_STEPS.findIndex((s) => s.id === order.status);
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-espresso/10 bg-linen-soft p-4"
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-espresso/60">
                      {order.id}
                    </p>
                    <p className="text-xs text-espresso/50">
                      {order.lines.reduce((n, l) => n + l.quantity, 0)} items
                    </p>
                  </div>
                  <ol className="mt-3 flex items-center" aria-label="Order status">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= stepIndex;
                      return (
                        <li key={step.id} className="flex flex-1 items-center last:flex-none">
                          <span className="flex flex-col items-center gap-1">
                            <span
                              aria-hidden
                              className={`h-3 w-3 rounded-full transition-colors duration-500 ${
                                done ? "bg-saffron" : "bg-espresso/15"
                              }`}
                            />
                            <span
                              className={`text-[10px] font-medium ${
                                done ? "text-espresso" : "text-espresso/40"
                              }`}
                            >
                              {step.label}
                            </span>
                          </span>
                          {i < STATUS_STEPS.length - 1 && (
                            <span
                              aria-hidden
                              className={`mx-1 mb-4 h-0.5 flex-1 rounded transition-colors duration-500 ${
                                i < stepIndex ? "bg-saffron" : "bg-espresso/10"
                              }`}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </section>
        )}

        {/* category tabs */}
        <div
          role="tablist"
          aria-label="Menu categories"
          className="sticky top-[57px] z-20 -mx-4 mt-4 flex gap-2 overflow-x-auto bg-linen px-4 py-2"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={cat.id === category}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 font-body text-sm font-medium transition-colors ${
                cat.id === category
                  ? "bg-espresso text-linen"
                  : "bg-espresso/5 text-espresso/70"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* items */}
        <ul className="mt-3 space-y-3" role="list">
          {!menuLoaded &&
            Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-espresso/5"
                aria-hidden
              />
            ))}
          {menuLoaded && items.length === 0 && (
            <li className="rounded-2xl border border-espresso/10 p-6 text-center text-sm text-espresso/60">
              Everything in this category just sold out — check back shortly.
            </li>
          )}
          {items.map((item) => {
            const qty = cart[item.id] ?? 0;
            return (
              <li
                key={item.id}
                className="flex gap-3 rounded-2xl border border-espresso/10 bg-linen-soft p-3"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-display text-base text-espresso">
                      {item.name}
                    </h3>
                    <span className="shrink-0 font-body text-sm font-semibold text-terracotta">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-espresso/60">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center justify-end">
                    {qty === 0 ? (
                      <button
                        onClick={() => setQty(item.id, 1)}
                        className="rounded-full bg-terracotta px-4 py-1.5 font-body text-xs font-semibold text-linen transition-transform active:scale-95"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-full bg-espresso px-2 py-1">
                        <button
                          onClick={() => setQty(item.id, qty - 1)}
                          aria-label={`Remove one ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-linen"
                        >
                          −
                        </button>
                        <span className="min-w-4 text-center text-sm font-semibold text-linen">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(item.id, qty + 1)}
                          aria-label={`Add one ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-linen"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-[11px] text-espresso/40">
          Contactless ordering demo · Powered by KelvionTech
        </p>
      </div>

      {/* cart bar */}
      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center justify-between rounded-full bg-espresso px-6 py-3.5 text-linen shadow-2xl shadow-black/30 transition-transform active:scale-[0.99]"
        >
          <span className="font-body text-sm font-semibold">
            {cartCount} item{cartCount > 1 ? "s" : ""} · ${cartTotal.toFixed(2)}
          </span>
          <span className="font-body text-sm font-semibold text-saffron">
            View cart →
          </span>
        </button>
      )}

      {/* cart sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-3xl bg-linen p-5 pb-8 motion-safe:animate-[fade-rise_0.35s_var(--ease-cubic)]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl italic text-espresso">
                Your order — table {table}
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso/5 text-espresso"
              >
                ✕
              </button>
            </div>

            <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto" role="list">
              {cartLines.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-espresso">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 rounded-full bg-espresso/5 px-2 py-0.5">
                    <button
                      onClick={() => setQty(item.id, qty - 1)}
                      aria-label={`Remove one ${item.name}`}
                      className="px-1 text-espresso"
                    >
                      −
                    </button>
                    <span className="min-w-4 text-center text-sm font-semibold text-espresso">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(item.id, qty + 1)}
                      aria-label={`Add one ${item.name}`}
                      className="px-1 text-espresso"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-14 text-right text-sm font-semibold text-terracotta">
                    ${(priceNumber(item.price) * qty).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <label htmlFor="order-note" className="mt-4 block text-xs font-medium uppercase tracking-[0.15em] text-espresso/60">
              Note for the kitchen
            </label>
            <input
              id="order-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="No onions, extra napkins…"
              className="mt-1.5 w-full rounded-xl border border-espresso/15 bg-white/60 px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 focus:border-terracotta focus:outline-none"
            />

            {error && (
              <p role="alert" className="mt-3 text-sm text-terracotta">
                {error}
              </p>
            )}

            <button
              onClick={submitOrder}
              disabled={submitting}
              className="mt-5 w-full rounded-full bg-terracotta py-3.5 font-body text-sm font-semibold text-linen transition-all active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting
                ? "Sending to the kitchen…"
                : `Place order · $${cartTotal.toFixed(2)}`}
            </button>
            <p className="mt-2 text-center text-[11px] text-espresso/40">
              Your food is delivered to table {table}. Pay at the counter or ask your server.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
