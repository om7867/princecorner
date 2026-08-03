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
  const restaurantSlug = params.get("r") ?? "";
  const isOnlineOrder = table === "ONLINE";
  const { settings } = useSiteSettings();

  // Appends `restaurant=<slug>` (as `&` or the first `?`, whichever fits the
  // URL) only when this table's QR code carried an `r` param — omitted
  // entirely otherwise, so it stays backward-compatible with QR codes
  // printed before multi-branch support existed.
  const withRestaurant = useCallback(
    (url: string) =>
      restaurantSlug
        ? `${url}${url.includes("?") ? "&" : "?"}restaurant=${encodeURIComponent(restaurantSlug)}`
        : url,
    [restaurantSlug]
  );

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
    fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/menu`))
      .then((r) => r.json())
      .then((items: MenuItemDTO[]) => {
        setMenu(items);
        setMenuLoaded(true);
      })
      .catch(() => setMenuLoaded(true));
  }, [withRestaurant]);

  useEffect(() => {
    fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/menu/categories`))
      .then((r) => r.json())
      .then((cats: CategoryDTO[]) => {
        setCategories(cats);
        setCategoryId((cur) => cur ?? cats[0]?.id ?? null);
      })
      .catch(() => {});
  }, [withRestaurant]);

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
    fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/orders?table=${encodeURIComponent(table)}`))
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
      fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/invoices/${savedInvoiceId}`))
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
  }, [table, storageKey, invoiceStorageKey, loadMenu, withRestaurant]);

  // real-time: my order status + menu 86 updates
  useEffect(() => {
    if (!table) return;
    let closedByUs = false;
    let retry = 0;
    let ws: WebSocket | null = null;

    function connect() {
      const wsUrl = PUBLIC_WS_BASE_URL || (window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host + "/api/public";
      ws = new WebSocket(withRestaurant(`${wsUrl}/ws/orders?table=${encodeURIComponent(table)}`));
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
  }, [table, loadMenu, invoiceStorageKey, withRestaurant]);

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
      channel: isOnlineOrder ? "online" : "dine_in",
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
      const res = await fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/orders`), {
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
      const prepRes = await fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/orders/prepare-payment`), {
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
          const confirmRes = await fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/orders/confirm-payment`), {
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
      const res = await fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/orders/demo-prepay`), {
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#0e0b08] px-6 text-center">
        <p className="font-body text-[10px] uppercase tracking-[0.4em] text-saffron">
          {restaurantName}
        </p>
        <h1 className="mt-4 font-display text-4xl italic text-linen">
          Scan your table code
        </h1>
        <p className="mt-4 max-w-xs font-body text-sm font-light leading-relaxed text-linen/60">
          Each table has its own unique QR code. Scanning it opens your dedicated luxury ordering experience.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0b08] pb-32 text-linen selection:bg-saffron selection:text-espresso">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0e0b08]/80 px-4 py-3 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <p className="font-display text-xl italic text-linen">{restaurantName}</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-linen/50 mt-0.5">
              {isOnlineOrder ? (
                <span className="font-semibold text-saffron">Online Order</span>
              ) : (
                <>
                  Table <span className="font-semibold text-saffron">{table}</span>
                </>
              )}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] uppercase tracking-widest font-medium text-linen/70">
            Live Order
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4">
        {invoice && (
          <BillView
            invoice={invoice}
            restaurantName={restaurantName}
            restaurantSlug={restaurantSlug || undefined}
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
                <div key={order.id} className="rounded-2xl border border-white/10 bg-[#14100b]/80 backdrop-blur-md p-5 shadow-xl">
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron">
                      Order {order.display_code}
                    </p>
                    <p className="text-[11px] uppercase tracking-widest text-linen/50">
                      {order.items.reduce((n, l) => n + l.quantity, 0)} items · <span className="text-linen">{formatMoney(order.total)}</span>
                    </p>
                  </div>
                  {order.status === "cancelled" ? (
                    <p className="mt-2 text-xs font-semibold text-terracotta uppercase tracking-wider">
                      ✕ Cancelled — please ask your server.
                    </p>
                  ) : (
                    <ol className="flex items-center" aria-label="Order status">
                      {STATUS_STEPS.map((step, i) => {
                        const done = i <= stepIndex;
                        return (
                          <li key={step.id} className="flex flex-1 items-center last:flex-none">
                            <span className="flex flex-col items-center gap-2">
                              <span
                                aria-hidden
                                className={`h-2.5 w-2.5 rounded-full transition-all duration-700 ${
                                  done ? "bg-saffron shadow-[0_0_8px_rgba(231,167,58,0.6)]" : "bg-white/10"
                                }`}
                              />
                              <span
                                className={`text-[9px] uppercase tracking-widest font-semibold transition-colors duration-700 ${
                                  done ? "text-linen" : "text-linen/30"
                                }`}
                              >
                                {step.label}
                              </span>
                            </span>
                            {i < STATUS_STEPS.length - 1 && (
                              <span
                                aria-hidden
                                className={`mx-2 mb-[18px] h-[1px] flex-1 rounded transition-colors duration-700 ${
                                  i < stepIndex ? "bg-saffron/50" : "bg-white/10"
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
          className="sticky top-[60px] z-20 -mx-4 mt-2 flex gap-2 overflow-x-auto bg-[#0e0b08]/95 backdrop-blur-xl px-4 py-3 no-scrollbar shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-b border-white/5"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={cat.id === categoryId}
              onClick={() => setCategoryId(cat.id)}
              className={`shrink-0 rounded-full px-5 py-2 font-body text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 ${
                cat.id === categoryId
                  ? "bg-saffron text-espresso shadow-[0_0_15px_rgba(231,167,58,0.3)]"
                  : "bg-white/5 text-linen/60 hover:bg-white/10 hover:text-linen border border-white/5"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* items */}
        <ul className="mt-6 space-y-4" role="list">
          {!menuLoaded &&
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="h-28 animate-pulse rounded-[1.5rem] bg-white/5 border border-white/5" aria-hidden />
            ))}
          {menuLoaded && items.length === 0 && (
            <li className="rounded-[1.5rem] border border-white/5 bg-[#14100b]/50 p-8 text-center font-body text-xs uppercase tracking-widest text-linen/40">
              Everything in this category just sold out — check back shortly.
            </li>
          )}
          {items.map((item) => {
            const qty = cart[item.id] ?? 0;
            return (
              <li
                key={item.id}
                className="flex gap-4 rounded-[1.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-3 shadow-lg transition-transform active:scale-[0.98]"
              >
                <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[1rem] shadow-inner">
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt={item.photo_alt ?? item.name}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5" />
                  )}
                </div>
                <div className="min-w-0 flex-1 flex flex-col py-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-display text-lg text-linen leading-tight">{item.name}</h3>
                  </div>
                  <p className="mt-1 line-clamp-2 font-body text-[11px] font-light text-linen/50 leading-relaxed">{item.description}</p>
                  <div className="mt-auto flex items-end justify-between">
                    <span className="font-body text-xs font-semibold text-saffron tracking-widest">
                      {formatMoney(item.base_price)}
                    </span>
                    {qty === 0 ? (
                      <button
                        onClick={() => setQty(item.id, 1)}
                        className="rounded-full border border-saffron/30 bg-saffron/10 px-5 py-1.5 font-body text-[10px] uppercase tracking-widest font-bold text-saffron transition-all hover:bg-saffron hover:text-espresso"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 rounded-full border border-saffron/30 bg-saffron/10 px-2 py-1 shadow-[0_0_15px_rgba(231,167,58,0.15)]">
                        <button
                          onClick={() => setQty(item.id, qty - 1)}
                          aria-label={`Remove one ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-saffron hover:bg-saffron hover:text-espresso transition-colors"
                        >
                          −
                        </button>
                        <span className="min-w-4 text-center font-body text-xs font-bold text-saffron">{qty}</span>
                        <button
                          onClick={() => setQty(item.id, qty + 1)}
                          aria-label={`Add one ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-saffron hover:bg-saffron hover:text-espresso transition-colors"
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

        <p className="mt-12 mb-6 text-center font-body text-[9px] uppercase tracking-[0.3em] text-linen/30">Contactless Ordering</p>
      </div>

      {/* cart bar */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6 pt-12 bg-gradient-to-t from-[#0e0b08] via-[#0e0b08]/80 to-transparent pointer-events-none">
          <button
            onClick={() => setCartOpen(true)}
            className="flex w-[calc(100%-3rem)] max-w-sm items-center justify-between rounded-full bg-saffron px-6 py-4 text-espresso shadow-[0_10px_40px_rgba(231,167,58,0.25)] transition-transform active:scale-[0.98] pointer-events-auto"
          >
            <span className="font-body text-[11px] uppercase tracking-widest font-bold">
              {cartCount} item{cartCount > 1 ? "s" : ""} · {formatMoney(cartTotal)}
            </span>
            <span className="font-body text-[11px] uppercase tracking-widest font-bold border border-espresso/20 rounded-full px-3 py-1 bg-espresso/5">View Cart →</span>
          </button>
        </div>
      )}

      {/* cart sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e0b08]/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-t-[2rem] bg-[#14100b] border-t border-white/10 p-6 pb-10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] motion-safe:animate-[fade-rise_0.35s_var(--ease-cubic)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl italic text-linen">
                Your Order{" "}
                <span className="text-saffron font-body not-italic text-sm ml-2">
                  {isOnlineOrder ? "Online Order" : `Table ${table}`}
                </span>
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-linen hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <ul className="mt-6 max-h-56 space-y-4 overflow-y-auto no-scrollbar" role="list">
              {cartLines.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center justify-between gap-4">
                  <span className="min-w-0 flex-1 truncate font-display text-lg text-linen/90">{item.name}</span>
                  <div className="flex items-center gap-3 rounded-full border border-saffron/20 bg-saffron/5 px-2 py-1">
                    <button
                      onClick={() => setQty(item.id, qty - 1)}
                      aria-label={`Remove one ${item.name}`}
                      className="px-2 text-saffron"
                    >
                      −
                    </button>
                    <span className="min-w-4 text-center font-body text-xs font-bold text-saffron">{qty}</span>
                    <button
                      onClick={() => setQty(item.id, qty + 1)}
                      aria-label={`Add one ${item.name}`}
                      className="px-2 text-saffron"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-16 text-right font-body text-sm font-semibold text-saffron">
                    {formatMoney(Number(item.base_price) * qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <label
                htmlFor="order-note"
                className="block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-linen/40 mb-2"
              >
                Note for the kitchen
              </label>
              <input
                id="order-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="No onions, extra napkins…"
                className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 font-body text-sm text-linen placeholder:text-linen/30 focus:border-saffron focus:outline-none transition-colors"
              />
            </div>

            <p className="mt-6 mb-3 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-linen/40">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                aria-pressed={paymentMethod === "cash"}
                className={`rounded-[1rem] border px-4 py-3 text-center font-body text-[11px] uppercase tracking-widest font-bold transition-colors ${
                  paymentMethod === "cash"
                    ? "border-saffron bg-saffron/10 text-saffron"
                    : "border-white/10 bg-transparent text-linen/40"
                }`}
              >
                Pay at counter
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                aria-pressed={paymentMethod === "online"}
                className={`rounded-[1rem] border px-4 py-3 text-center font-body text-[11px] uppercase tracking-widest font-bold transition-colors ${
                  paymentMethod === "online"
                    ? "border-saffron bg-saffron/10 text-saffron"
                    : "border-white/10 bg-transparent text-linen/40"
                }`}
              >
                Pay online now
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-center text-xs font-semibold uppercase tracking-wider text-terracotta">
                {error}
              </p>
            )}

            <button
              onClick={submitOrder}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-saffron py-4 font-body text-xs uppercase tracking-widest font-bold text-espresso shadow-[0_5px_20px_rgba(231,167,58,0.3)] transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
            >
              {submitting
                ? paymentMethod === "online"
                  ? "Opening gateway…"
                  : "Sending ticket…"
                : paymentMethod === "online"
                  ? `Pay ${formatMoney(cartTotal)} & Order`
                  : `Place Order · ${formatMoney(cartTotal)}`}
            </button>
            <p className="mt-4 text-center font-body text-[10px] leading-relaxed text-linen/30 max-w-xs mx-auto">
              {paymentMethod === "online"
                ? "Your order goes to the kitchen the moment payment is confirmed."
                : isOnlineOrder
                  ? "Your order is being prepared for pickup/delivery. Pay at the counter or ask your server."
                  : `Your food is delivered to Table ${table}. Pay at the counter or ask your server.`}
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
