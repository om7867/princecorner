"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { PUBLIC_API_BASE_URL, PUBLIC_WS_BASE_URL } from "@/lib/env";
import { loadRazorpayScript } from "@/lib/razorpay";
import { formatMoney } from "@/lib/types";
import type { CategoryDTO, InvoiceDTO, MenuItemDTO, OrderDTO, OrderStatus } from "@/lib/types";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { BillView } from "./BillView";
import { DemoCardModal } from "@/components/order/DemoCardModal";

type PaymentMethod = "cash" | "online";

const STATUS_STEPS: { id: OrderStatus; label: string }[] = [
  { id: "received", label: "Received" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "served", label: "Served" },
];

export function OrderApp() {
  const params = useSearchParams();
  const table = (params.get("table") ?? "").toUpperCase();
  const { settings } = useSiteSettings();

  const [menu, setMenu] = useState<MenuItemDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState<OrderDTO[]>([]);
  const myOrderIds = useRef<Set<string>>(new Set());
  const [invoice, setInvoice] = useState<InvoiceDTO | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [demoPrepayOpen, setDemoPrepayOpen] = useState(false);

  const storageKey = `guest-orders-${table}`;
  const invoiceStorageKey = `guest-invoice-${table}`;

  const loadMenu = useCallback(() => {
    fetch(`${PUBLIC_API_BASE_URL}/menu`)
      .then((r) => r.json())
      .then((items: MenuItemDTO[]) => {
        setMenu(items);
        setMenuLoaded(true);
      })
      .catch(() => setMenuLoaded(true));
  }, []);

  useEffect(() => {
    fetch(`${PUBLIC_API_BASE_URL}/menu/categories`)
      .then((r) => r.json())
      .then((cats: CategoryDTO[]) => {
        setCategories(cats);
        setCategoryId((cur) => cur ?? cats[0]?.id ?? null);
      })
      .catch(() => {});
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
    fetch(`${PUBLIC_API_BASE_URL}/orders?table=${encodeURIComponent(table)}`)
      .then((r) => r.json())
      .then((orders: OrderDTO[]) => {
        setMyOrders(orders.filter((o) => myOrderIds.current.has(o.id)));
      })
      .catch(() => {});

    // restore an in-progress bill across page reloads (discovered live via WS
    // otherwise) — but never a bill that's already settled, so a new party
    // seated at this table later doesn't see the previous guest's paid bill.
    const savedInvoiceId = localStorage.getItem(invoiceStorageKey);
    if (savedInvoiceId) {
      fetch(`${PUBLIC_API_BASE_URL}/invoices/${savedInvoiceId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: InvoiceDTO | null) => {
          if (data && data.status !== "paid" && data.status !== "refunded") {
            setInvoice(data);
          } else {
            localStorage.removeItem(invoiceStorageKey);
          }
        })
        .catch(() => {});
    }
  }, [table, storageKey, invoiceStorageKey, loadMenu]);

  // real-time: my order status + menu 86 updates
  useEffect(() => {
    if (!table) return;
    let closedByUs = false;
    let retry = 0;
    let ws: WebSocket | null = null;

    function connect() {
      ws = new WebSocket(`${PUBLIC_WS_BASE_URL}/ws/orders?table=${encodeURIComponent(table)}`);
      ws.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          if (event.type === "order.updated" || event.type === "order.created") {
            const order: OrderDTO = event.order;
            if (!myOrderIds.current.has(order.id)) return;
            setMyOrders((prev) => {
              const rest = prev.filter((o) => o.id !== order.id);
              return [order, ...rest];
            });
          } else if (event.type === "menu.updated") {
            loadMenu();
          } else if (event.type === "invoice.created" || event.type === "invoice.updated") {
            const inv: InvoiceDTO = event.invoice;
            setInvoice(inv);
            localStorage.setItem(invoiceStorageKey, inv.id);
          }
        } catch {
          /* ignore malformed */
        }
      };
      ws.onopen = () => {
        retry = 0;
      };
      ws.onclose = () => {
        if (!closedByUs) {
          const delay = Math.min(1000 * 2 ** retry, 15000);
          retry += 1;
          setTimeout(connect, delay);
        }
      };
    }

    connect();
    return () => {
      closedByUs = true;
      ws?.close();
    };
  }, [table, loadMenu, invoiceStorageKey]);

  const items = useMemo(
    () => menu.filter((m) => m.category_id === categoryId),
    [menu, categoryId]
  );

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = menu.find((m) => m.id === id);
          return item ? { item, qty } : null;
        })
        .filter((x): x is { item: MenuItemDTO; qty: number } => !!x && x.qty > 0),
    [cart, menu]
  );

  const cartCount = cartLines.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cartLines.reduce((sum, l) => sum + Number(l.item.base_price) * l.qty, 0);

  function setQty(id: string, qty: number) {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, Math.min(20, qty)) }));
  }

  function cartPayload() {
    return {
      table,
      note,
      lines: cartLines.map((l) => ({ menu_item_id: l.item.id, quantity: l.qty, addon_ids: [] })),
    };
  }

  function finalizeOrderPlaced(order: OrderDTO, inv?: InvoiceDTO) {
    myOrderIds.current.add(order.id);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(myOrderIds.current)));
    setMyOrders((prev) => [order, ...prev]);
    if (inv) {
      setInvoice(inv);
      localStorage.setItem(invoiceStorageKey, inv.id);
    }
    setCart({});
    setNote("");
    setCartOpen(false);
  }

  async function submitOrder() {
    if (cartLines.length === 0 || submitting) return;
    if (paymentMethod === "online") {
      await submitOnlineOrder();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.detail ?? "Something went wrong — please try again.");
        if (res.status === 422) loadMenu();
        return;
      }
      const order: OrderDTO = await res.json();
      finalizeOrderPlaced(order);
    } catch {
      setError("Couldn't reach the kitchen — check your connection and tap again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Pay-online-first: the order isn't created until payment clears, so the
  // kitchen never sees an unpaid ticket for this path.
  async function submitOnlineOrder() {
    setSubmitting(true);
    setError(null);
    try {
      if (!settings?.razorpay_enabled) {
        setDemoPrepayOpen(true);
        return;
      }

      const payload = cartPayload();
      const prepRes = await fetch(`${PUBLIC_API_BASE_URL}/orders/prepare-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!prepRes.ok) {
        const data = await prepRes.json().catch(() => null);
        setError(data?.detail ?? "Couldn't start the payment — please try again.");
        return;
      }
      const { razorpay_order_id, amount_paise, key_id } = await prepRes.json();

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Couldn't load the payment window — please try cash instead.");
        return;
      }

      const rzp = new window.Razorpay({
        key: key_id,
        amount: amount_paise,
        currency: "INR",
        order_id: razorpay_order_id,
        name: restaurantName,
        theme: { color: "#c1622c" },
        handler: async (response) => {
          const confirmRes = await fetch(`${PUBLIC_API_BASE_URL}/orders/confirm-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: payload, ...response }),
          });
          if (confirmRes.ok) {
            const { order, invoice: inv } = await confirmRes.json();
            finalizeOrderPlaced(order, inv);
          } else {
            const data = await confirmRes.json().catch(() => null);
            setError(
              data?.detail ??
                "Payment succeeded but we couldn't confirm the order — please show your payment screen to staff."
            );
          }
        },
      });
      rzp.open();
    } finally {
      setSubmitting(false);
    }
  }

  async function submitDemoPrepay(): Promise<boolean> {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/orders/demo-prepay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload()),
      });
      if (!res.ok) return false;
      const { order, invoice: inv } = await res.json();
      finalizeOrderPlaced(order, inv);
      return true;
    } catch {
      return false;
    }
  }

  const restaurantName = settings?.name ?? "";

  /* ── no/invalid table ── */
  if (!table) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-espresso px-6 text-center">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
          {restaurantName} Table Ordering
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
            <p className="font-display text-lg italic text-espresso">{restaurantName}</p>
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
        {invoice && (
          <BillView
            invoice={invoice}
            restaurantName={restaurantName}
            razorpayEnabled={settings?.razorpay_enabled ?? false}
            onInvoiceUpdate={setInvoice}
            onDismiss={() => {
              setInvoice(null);
              localStorage.removeItem(invoiceStorageKey);
            }}
          />
        )}

        {/* live order trackers */}
        {myOrders.length > 0 && (
          <section aria-label="Your orders" className="mt-4 space-y-3">
            {myOrders.map((order) => {
              const stepIndex = STATUS_STEPS.findIndex((s) => s.id === order.status);
              return (
                <div key={order.id} className="rounded-2xl border border-espresso/10 bg-linen-soft p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-espresso/60">
                      {order.display_code}
                    </p>
                    <p className="text-xs text-espresso/50">
                      {order.items.reduce((n, l) => n + l.quantity, 0)} items · {formatMoney(order.total)}
                    </p>
                  </div>
                  {order.status === "cancelled" ? (
                    <p className="mt-2 text-sm font-semibold text-terracotta">
                      ✕ Cancelled — ask your server if this wasn&apos;t expected.
                    </p>
                  ) : (
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
                  )}
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
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={cat.id === categoryId}
              onClick={() => setCategoryId(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 font-body text-sm font-medium transition-colors ${
                cat.id === categoryId
                  ? "bg-espresso text-linen"
                  : "bg-espresso/5 text-espresso/70"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* items */}
        <ul className="mt-3 space-y-3" role="list">
          {!menuLoaded &&
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="h-24 animate-pulse rounded-2xl bg-espresso/5" aria-hidden />
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
                  {item.photo_url && (
                    <Image
                      src={item.photo_url}
                      alt={item.photo_alt ?? item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-display text-base text-espresso">{item.name}</h3>
                    <span className="shrink-0 font-body text-sm font-semibold text-terracotta">
                      {formatMoney(item.base_price)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-espresso/60">{item.description}</p>
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
                        <span className="min-w-4 text-center text-sm font-semibold text-linen">{qty}</span>
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

        <p className="mt-8 text-center text-[11px] text-espresso/40">Contactless ordering</p>
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
          <span className="font-body text-sm font-semibold text-saffron">View cart →</span>
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
                  <span className="min-w-0 flex-1 truncate text-sm text-espresso">{item.name}</span>
                  <div className="flex items-center gap-2 rounded-full bg-espresso/5 px-2 py-0.5">
                    <button
                      onClick={() => setQty(item.id, qty - 1)}
                      aria-label={`Remove one ${item.name}`}
                      className="px-1 text-espresso"
                    >
                      −
                    </button>
                    <span className="min-w-4 text-center text-sm font-semibold text-espresso">{qty}</span>
                    <button
                      onClick={() => setQty(item.id, qty + 1)}
                      aria-label={`Add one ${item.name}`}
                      className="px-1 text-espresso"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-14 text-right text-sm font-semibold text-terracotta">
                    {formatMoney(Number(item.base_price) * qty)}
                  </span>
                </li>
              ))}
            </ul>

            <label
              htmlFor="order-note"
              className="mt-4 block text-xs font-medium uppercase tracking-[0.15em] text-espresso/60"
            >
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

            <p className="mt-4 mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-espresso/60">
              How will you pay?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                aria-pressed={paymentMethod === "cash"}
                className={`rounded-xl border px-3 py-2.5 text-center font-body text-sm font-semibold transition-colors ${
                  paymentMethod === "cash"
                    ? "border-terracotta bg-terracotta/10 text-terracotta"
                    : "border-espresso/15 text-espresso/60"
                }`}
              >
                Cash / pay at counter
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                aria-pressed={paymentMethod === "online"}
                className={`rounded-xl border px-3 py-2.5 text-center font-body text-sm font-semibold transition-colors ${
                  paymentMethod === "online"
                    ? "border-terracotta bg-terracotta/10 text-terracotta"
                    : "border-espresso/15 text-espresso/60"
                }`}
              >
                Pay online now
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-3 text-sm text-terracotta">
                {error}
              </p>
            )}

            <button
              onClick={submitOrder}
              disabled={submitting}
              className="mt-4 w-full rounded-full bg-terracotta py-3.5 font-body text-sm font-semibold text-linen transition-all active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting
                ? paymentMethod === "online"
                  ? "Opening payment…"
                  : "Sending to the kitchen…"
                : paymentMethod === "online"
                  ? `Pay $${cartTotal.toFixed(2)} & place order`
                  : `Place order · $${cartTotal.toFixed(2)}`}
            </button>
            <p className="mt-2 text-center text-[11px] text-espresso/40">
              {paymentMethod === "online"
                ? "Your order goes to the kitchen the moment payment is confirmed."
                : `Your food is delivered to table ${table}. Pay at the counter or ask your server.`}
            </p>
          </div>
        </div>
      )}

      {demoPrepayOpen && (
        <DemoCardModal
          restaurantName={restaurantName}
          amountLabel={`$${cartTotal.toFixed(2)}`}
          onClose={() => setDemoPrepayOpen(false)}
          onSubmit={async () => {
            const ok = await submitDemoPrepay();
            if (ok) setDemoPrepayOpen(false);
            return ok;
          }}
        />
      )}
    </main>
  );
}
