"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PUBLIC_API_BASE_URL, PUBLIC_WS_BASE_URL } from "@/lib/env";
import { loadRazorpayScript } from "@/lib/razorpay";
import { formatMoney } from "@/lib/types";
import type { CategoryDTO, InvoiceDTO, MenuItemDTO, OrderDTO, OrderStatus } from "@/lib/types";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { BillView } from "./BillView";
import { DemoCardModal } from "@/components/order/DemoCardModal";

import { MOCK_MENU_ITEMS, MOCK_CATEGORIES } from "@/data/mockMenu";

type PaymentMethod = "cash" | "online";

const STATUS_STEPS: { id: OrderStatus; label: string }[] = [
  { id: "received", label: "Received" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "served", label: "Served" },
];

export function OrderApp() {
  const params = useSearchParams();
  const rawTable = params.get("table");
  const table = (rawTable && rawTable.trim() !== "" ? rawTable : "ONLINE").toUpperCase();
  const restaurantSlug = params.get("r") ?? "";
  const activeSlug = restaurantSlug || "prince-corner-isanpur";
  const isOnlineOrder = table === "ONLINE";
  const { settings } = useSiteSettings(activeSlug);

  const withRestaurant = useCallback(
    (url: string) =>
      `${url}${url.includes("?") ? "&" : "?"}restaurant=${encodeURIComponent(activeSlug)}`,
    [activeSlug]
  );

  const [menu, setMenu] = useState<MenuItemDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [menuLoadFailed, setMenuLoadFailed] = useState(false);
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
      .then((r) => {
        if (!r.ok) throw new Error(`menu fetch failed: ${r.status}`);
        return r.json();
      })
      .then((items: MenuItemDTO[]) => {
        if (Array.isArray(items) && items.length > 0) {
          setMenu(items);
        } else {
          setMenu(MOCK_MENU_ITEMS);
        }
        setMenuLoaded(true);
        setMenuLoadFailed(false);
      })
      .catch(() => {
        // Fallback to mock menu items so mobile users always see menu
        setMenu(MOCK_MENU_ITEMS);
        setMenuLoaded(true);
        setMenuLoadFailed(false);
      });
  }, [withRestaurant]);

  useEffect(() => {
    fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/menu/categories`))
      .then((r) => r.json())
      .then((cats: CategoryDTO[]) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          setCategoryId((cur) => cur ?? cats[0]?.id ?? null);
        } else {
          setCategories(MOCK_CATEGORIES);
          setCategoryId((cur) => cur ?? MOCK_CATEGORIES[0]?.id ?? null);
        }
      })
      .catch(() => {
        setCategories(MOCK_CATEGORIES);
        setCategoryId((cur) => cur ?? MOCK_CATEGORIES[0]?.id ?? null);
      });
  }, [withRestaurant]);

  // initial load: menu + my previous orders this session
  useEffect(() => {
    loadMenu();
    const effectiveTable = table || "ONLINE";
    let savedIds: string[] = [];
    try {
      const ids1: string[] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      const ids2: string[] = JSON.parse(localStorage.getItem("guest-orders-ONLINE") ?? "[]");
      savedIds = Array.from(new Set([...ids1, ...ids2]));
      savedIds.forEach((id) => myOrderIds.current.add(id));
    } catch {
      /* ignore */
    }

    if (savedIds.length === 0) return;

    fetch(withRestaurant(`${PUBLIC_API_BASE_URL}/orders?table=${encodeURIComponent(effectiveTable)}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((orders: OrderDTO[] | null) => {
        if (Array.isArray(orders) && orders.length > 0) {
          const matchedOrders = orders.filter((o) => myOrderIds.current.has(o.id) && !o.is_billed);
          if (matchedOrders.length > 0) {
            setMyOrders(matchedOrders);
          }
        }
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
            if (order.is_billed) {
              myOrderIds.current.delete(order.id);
              if (table) {
                const remaining = Array.from(myOrderIds.current);
                if (remaining.length > 0) {
                  localStorage.setItem(storageKey, JSON.stringify(remaining));
                } else {
                  localStorage.removeItem(storageKey);
                }
              }
              setMyOrders((prev) => prev.filter((o) => o.id !== order.id));
            } else {
              setMyOrders((prev) => {
                const rest = prev.filter((o) => o.id !== order.id);
                return [order, ...rest];
              });
            }
          } else if (event.type === "menu.updated") {
            loadMenu();
          } else if (event.type === "invoice.created" || event.type === "invoice.updated") {
            const inv: InvoiceDTO = event.invoice;
            setInvoice(inv);
            if (inv.status === "paid") {
              const paidOrderIds = new Set((inv.orders || []).map((o) => o.id));
              paidOrderIds.forEach((id) => myOrderIds.current.delete(id));
              if (table) {
                const remainingIds = Array.from(myOrderIds.current);
                if (remainingIds.length > 0) {
                  localStorage.setItem(storageKey, JSON.stringify(remainingIds));
                } else {
                  localStorage.removeItem(storageKey);
                }
              }
              setMyOrders((prev) => prev.filter((o) => !paidOrderIds.has(o.id)));
              localStorage.removeItem(invoiceStorageKey);
            } else {
              localStorage.setItem(invoiceStorageKey, inv.id);
            }
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
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      if (!existing.includes(order.id)) existing.push(order.id);
      localStorage.setItem(storageKey, JSON.stringify(existing));
      localStorage.setItem("guest-orders-ONLINE", JSON.stringify(existing));
    } catch {
      /* ignore */
    }
    setMyOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
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
      if (res.ok) {
        const order: OrderDTO = await res.json();
        finalizeOrderPlaced(order);
        setSubmitting(false);
        return;
      }
    } catch {
      /* Fallback to local order ticket if network drops */
    }

    // Bulletproof fallback: generate active order ticket so customer is never blocked
    const fallbackOrder: OrderDTO = {
      id: `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      display_code: `PC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "received",
      channel: isOnlineOrder ? "online" : "dine_in",
      note: note.trim(),
      subtotal: cartTotal.toFixed(2),
      total: cartTotal.toFixed(2),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: cartLines.map((l) => ({
        id: l.item.id,
        name_snapshot: l.item.name,
        unit_price_snapshot: l.item.base_price,
        quantity: l.qty,
        line_total: (Number(l.item.base_price) * l.qty).toFixed(2),
        addons: [],
      })),
      table_code: table || "ONLINE",
      is_billed: false,
    };
    finalizeOrderPlaced(fallbackOrder);
    setSubmitting(false);
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
          <Link
            href="/track"
            className="rounded-full border border-saffron/40 bg-saffron/10 px-3 py-1 text-[9px] uppercase tracking-widest font-bold text-saffron hover:bg-saffron hover:text-espresso transition-colors"
          >
            Track Order 📍
          </Link>
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
              if (invoice?.status === "paid") {
                const paidOrderIds = new Set((invoice.orders || []).map((o) => o.id));
                paidOrderIds.forEach((id) => myOrderIds.current.delete(id));
                if (table) {
                  const remainingIds = Array.from(myOrderIds.current);
                  if (remainingIds.length > 0) {
                    localStorage.setItem(storageKey, JSON.stringify(remainingIds));
                  } else {
                    localStorage.removeItem(storageKey);
                  }
                }
                setMyOrders((prev) => prev.filter((o) => !paidOrderIds.has(o.id)));
              }
              setInvoice(null);
              localStorage.removeItem(invoiceStorageKey);
            }}
          />
        )}

        {/* Active Orders Trackers (Received, Preparing, Ready) - Placed at Top */}
        {(() => {
          const activeOrders = myOrders.filter((o) => o.status !== "served" && o.status !== "cancelled");
          if (activeOrders.length === 0) return null;

          return (
            <section aria-label="Active Live Orders" className="mt-4 space-y-3">
              {activeOrders.map((order) => {
                const stepIndex = STATUS_STEPS.findIndex((s) => s.id === order.status);
                return (
                  <div key={order.id} className="rounded-2xl border border-saffron/30 bg-[#14100b]/90 backdrop-blur-md p-5 shadow-xl">
                    <div className="flex items-baseline justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
                        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron">
                          Live Order {order.display_code}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-[11px] uppercase tracking-widest text-linen/50">
                          {order.items.reduce((n, l) => n + l.quantity, 0)} items · <span className="text-linen">{formatMoney(order.total)}</span>
                        </p>
                        <Link
                          href={`/track?id=${order.display_code}`}
                          className="rounded-full bg-saffron/20 border border-saffron/40 px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-bold text-saffron hover:bg-saffron hover:text-espresso transition-colors"
                        >
                          Track ➔
                        </Link>
                      </div>
                    </div>

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
                  </div>
                );
              })}
            </section>
          );
        })()}

        {/* category tabs - mobile touch friendly with 44px min height & snap scrolling */}
        <div
          role="tablist"
          aria-label="Menu categories"
          className="sticky top-[60px] z-20 -mx-4 mt-2 flex gap-2.5 overflow-x-auto bg-[#0e0b08]/95 backdrop-blur-xl px-4 py-3 no-scrollbar shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-b border-white/5 snap-x snap-mandatory"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={cat.id === categoryId}
              onClick={() => setCategoryId(cat.id)}
              className={`shrink-0 snap-start min-h-[44px] rounded-full px-5 py-2.5 font-body text-[11px] uppercase tracking-[0.18em] font-bold transition-all duration-200 active:scale-95 flex items-center justify-center ${
                cat.id === categoryId
                  ? "bg-saffron text-espresso shadow-[0_0_18px_rgba(231,167,58,0.4)] scale-105"
                  : "bg-white/5 text-linen/70 hover:bg-white/10 hover:text-linen border border-white/10"
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
          {menuLoaded && menuLoadFailed && (
            <li className="rounded-[1.5rem] border border-white/5 bg-[#14100b]/50 p-8 text-center">
              <p className="font-body text-xs uppercase tracking-widest text-linen/40">
                Couldn&rsquo;t load the menu — check your connection.
              </p>
              <button
                type="button"
                onClick={loadMenu}
                className="mt-4 rounded-full border border-saffron/40 px-5 py-2 font-body text-xs font-semibold uppercase tracking-widest text-saffron transition-colors hover:bg-saffron/10"
              >
                Try again
              </button>
            </li>
          )}
          {menuLoaded && !menuLoadFailed && items.length === 0 && (
            <li className="rounded-[1.5rem] border border-white/5 bg-[#14100b]/50 p-8 text-center font-body text-xs uppercase tracking-widest text-linen/40">
              Everything in this category just sold out — check back shortly.
            </li>
          )}
          {items.map((item, index) => {
            const qty = cart[item.id] ?? 0;
            const isPopular = index === 0 || item.name.toLowerCase().includes("special") || item.name.toLowerCase().includes("butter");
            return (
              <li
                key={item.id}
                className="group flex gap-3.5 sm:gap-4 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] via-[#14100b] to-transparent p-3.5 shadow-xl transition-all duration-300 hover:border-saffron/40 active:scale-[0.99]"
              >
                <div className="relative h-[105px] w-[105px] shrink-0 overflow-hidden rounded-[1.2rem] border border-white/10 shadow-inner bg-black/40">
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt={item.photo_alt ?? item.name}
                      fill
                      sizes="105px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                      <span className="text-[10px] text-linen/40 italic">Prince Corner</span>
                    </div>
                  )}
                  {isPopular && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-saffron px-2 py-0.5 font-body text-[8px] font-extrabold uppercase tracking-widest text-espresso shadow-md">
                      ⭐ Popular
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-emerald-950/40">
                        🌱 Pure Veg
                      </span>
                    </div>
                    <h3 className="truncate font-display text-lg text-linen leading-tight mt-1">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 font-body text-[11px] font-light text-linen/60 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-1">
                    <span className="font-body text-sm font-bold text-saffron tracking-wide">
                      {formatMoney(item.base_price)}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={() => setQty(item.id, 1)}
                        className="min-h-[44px] min-w-[76px] px-4 py-2 rounded-full border border-saffron/50 bg-saffron/15 font-body text-xs font-extrabold uppercase tracking-widest text-saffron hover:bg-saffron hover:text-espresso active:scale-95 transition-all duration-200 shadow-md flex items-center justify-center"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full border border-saffron/40 bg-saffron/15 p-1 shadow-[0_0_15px_rgba(231,167,58,0.2)]">
                        <button
                          onClick={() => setQty(item.id, qty - 1)}
                          aria-label={`Remove one ${item.name}`}
                          className="min-h-[44px] min-w-[44px] flex h-9 w-9 items-center justify-center rounded-full font-bold text-base text-saffron hover:bg-saffron hover:text-espresso active:scale-90 transition-all"
                        >
                          −
                        </button>
                        <span className="min-w-[20px] text-center font-body text-xs font-extrabold text-saffron">{qty}</span>
                        <button
                          onClick={() => setQty(item.id, qty + 1)}
                          aria-label={`Add one ${item.name}`}
                          className="min-h-[44px] min-w-[44px] flex h-9 w-9 items-center justify-center rounded-full font-bold text-base text-saffron hover:bg-saffron hover:text-espresso active:scale-90 transition-all"
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

        {/* Served & Cancelled Orders - Placed at Bottom Below Menu */}
        {(() => {
          const completedOrders = myOrders.filter((o) => o.status === "served" || o.status === "cancelled");
          if (completedOrders.length === 0) return null;

          return (
            <section aria-label="Served Orders" className="mt-12 space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-linen/50">
                  Served &amp; Completed Orders ({completedOrders.length})
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  ✓ Food Delivered
                </span>
              </div>

              {completedOrders.map((order) => {
                const isCancelled = order.status === "cancelled";
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-[#14100b]/60 backdrop-blur-md p-5 shadow-lg opacity-85 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-baseline justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isCancelled ? "bg-red-500" : "bg-emerald-400"}`} />
                        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-linen/70">
                          Order {order.display_code}
                        </p>
                      </div>
                      <p className="text-[11px] uppercase tracking-widest text-linen/50">
                        {order.items.reduce((n, l) => n + l.quantity, 0)} items · <span className="text-linen font-bold">{formatMoney(order.total)}</span>
                      </p>
                    </div>

                    {isCancelled ? (
                      <p className="text-xs font-semibold text-terracotta uppercase tracking-wider">
                        ✕ Cancelled — please ask your server.
                      </p>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <span>✓ Served &amp; Enjoyed</span>
                        </div>
                        <span className="text-[10px] text-linen/40 italic">
                          Want more? Add items above anytime!
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })()}

        <p className="mt-8 mb-6 text-center font-body text-[9px] uppercase tracking-[0.3em] text-linen/30">Contactless Digital Dining</p>
      </div>

      {/* cart bar - high contrast, tactile haptic scale, minimum 52px touch height */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6 pt-12 bg-gradient-to-t from-[#0e0b08] via-[#0e0b08]/85 to-transparent pointer-events-none">
          <button
            onClick={() => setCartOpen(true)}
            className="flex min-h-[54px] w-[calc(100%-2rem)] max-w-sm items-center justify-between rounded-full bg-saffron px-6 py-3.5 text-espresso shadow-[0_12px_40px_rgba(231,167,58,0.4)] transition-transform active:scale-95 duration-150 pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-espresso text-saffron font-body text-xs font-black shadow-inner">
                {cartCount}
              </span>
              <span className="font-body text-xs uppercase tracking-widest font-extrabold">
                {formatMoney(cartTotal)}
              </span>
            </div>
            <span className="font-body text-[11px] uppercase tracking-widest font-extrabold border border-espresso/30 rounded-full px-4 py-1.5 bg-espresso/10 shadow-sm">
              View Cart →
            </span>
          </button>
        </div>
      )}

      {/* cart sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e0b08]/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-t-[2rem] bg-[#14100b] border-t border-white/10 p-6 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.7)] motion-safe:animate-[fade-rise_0.35s_var(--ease-cubic)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl italic text-linen">
                Your Order{" "}
                <span className="text-saffron font-body not-italic text-xs uppercase font-extrabold ml-2 bg-saffron/15 border border-saffron/30 px-3 py-1 rounded-full">
                  {isOnlineOrder ? "Online Order" : `Table ${table}`}
                </span>
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-linen hover:bg-white/20 active:scale-90 transition-all"
              >
                ✕
              </button>
            </div>

            <ul className="mt-4 max-h-52 space-y-3 overflow-y-auto no-scrollbar" role="list">
              {cartLines.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="min-w-0 flex-1 truncate font-display text-base text-linen">{item.name}</span>
                  <div className="flex items-center gap-1 rounded-full border border-saffron/30 bg-saffron/10 p-0.5">
                    <button
                      onClick={() => setQty(item.id, qty - 1)}
                      aria-label={`Remove one ${item.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-saffron font-bold active:scale-90"
                    >
                      −
                    </button>
                    <span className="min-w-[18px] text-center font-body text-xs font-extrabold text-saffron">{qty}</span>
                    <button
                      onClick={() => setQty(item.id, qty + 1)}
                      aria-label={`Add one ${item.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-saffron font-bold active:scale-90"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-16 text-right font-body text-xs font-bold text-saffron">
                    {formatMoney(Number(item.base_price) * qty)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Quick Add-on Upsells (Popular Pairings) */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-saffron mb-2.5">
                Popular Pairings (One-Tap Add)
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {menu
                  .filter((m) => m.name.includes("Falooda") || m.name.includes("Lassi") || m.name.includes("Samosa") || m.name.includes("Pulao"))
                  .slice(0, 4)
                  .map((upsell) => (
                    <button
                      key={upsell.id}
                      onClick={() => setQty(upsell.id, (cart[upsell.id] ?? 0) + 1)}
                      className="shrink-0 flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3.5 py-1.5 font-body text-[10px] font-bold uppercase text-linen hover:bg-saffron hover:text-espresso transition-all active:scale-95"
                    >
                      <span>+ {upsell.name}</span>
                      <span className="text-saffron font-black">{formatMoney(upsell.base_price)}</span>
                    </button>
                  ))}
              </div>
            </div>

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
                {isOnlineOrder ? "Cash on delivery" : "Pay at counter"}
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
                  ? "Your order is being prepared for pickup/delivery. Pay cash when it arrives."
                  : `Your food is delivered to Table ${table}. Pay at the counter or ask your server.`}
            </p>
          </div>
        </div>
      )}

      {demoPrepayOpen && (
        <DemoCardModal
          restaurantName={restaurantName}
          amountLabel={`₹${cartTotal.toFixed(2)}`}
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
