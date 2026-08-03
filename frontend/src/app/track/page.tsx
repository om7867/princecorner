"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { formatMoney } from "@/lib/types";
import type { OrderDTO, OrderStatus } from "@/lib/types";
import { SiteNavbar } from "@/components/ui/SiteNavbar";
import { LocationFooter } from "@/components/sections/LocationFooter";

const STATUS_STEPS: { id: OrderStatus; label: string; desc: string; icon: string }[] = [
  { id: "received", label: "Order Received", desc: "Your order has reached our kitchen.", icon: "📝" },
  { id: "preparing", label: "Preparing", desc: "Our chef is preparing your dishes live.", icon: "🍳" },
  { id: "ready", label: "Ready to Serve", desc: "Your food is fresh & hot, ready to deliver!", icon: "🔔" },
  { id: "served", label: "Served / Completed", desc: "Enjoy your authentic Prince Corner feast!", icon: "🎉" },
];

function OrderTrackerContent() {
  const params = useSearchParams();
  const queryId = params.get("id") ?? "";
  const queryTable = params.get("table") ?? "";

  const [searchQuery, setSearchQuery] = useState(queryId);
  const [activeOrder, setActiveOrder] = useState<OrderDTO | null>(null);
  const [allOrders, setAllOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order by ID or load all local/server orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Gather saved local order IDs from browser localStorage
    let savedIds: string[] = [];
    try {
      const ids1: string[] = JSON.parse(localStorage.getItem("guest-orders-ONLINE") ?? "[]");
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("guest-orders-"));
      keys.forEach((k) => {
        try {
          const parsed = JSON.parse(localStorage.getItem(k) ?? "[]");
          if (Array.isArray(parsed)) savedIds.push(...parsed);
        } catch {}
      });
      savedIds = Array.from(new Set(savedIds));
    } catch {}

    try {
      // Fetch all public orders from server
      const res = await fetch(`${PUBLIC_API_BASE_URL}/orders`);
      let serverOrders: OrderDTO[] = [];
      if (res.ok) {
        serverOrders = await res.json();
      }

      // Filter or find matching order
      if (Array.isArray(serverOrders) && serverOrders.length > 0) {
        setAllOrders(serverOrders);

        if (queryId) {
          const target = serverOrders.find(
            (o) =>
              o.id.toLowerCase() === queryId.toLowerCase() ||
              o.display_code.toLowerCase() === queryId.toLowerCase()
          );
          if (target) {
            setActiveOrder(target);
            setLoading(false);
            return;
          }
        }

        // If saved IDs exist, find the latest matching order
        if (savedIds.length > 0) {
          const myMatched = serverOrders.filter((o) => savedIds.includes(o.id));
          if (myMatched.length > 0) {
            setActiveOrder(myMatched[0]);
            setLoading(false);
            return;
          }
        }

        // Fallback to first active server order
        setActiveOrder(serverOrders[0]);
      } else {
        // If server returned no orders, construct from localStorage saved orders
        setAllOrders([]);
        setActiveOrder(null);
      }
    } catch {
      setError("Unable to connect to server. Showing cached order status.");
    } finally {
      setLoading(false);
    }
  }, [queryId]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000); // Live poll every 4 seconds
    return () => clearInterval(interval);
  }, [loadOrders]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cleanQuery = searchQuery.trim().toLowerCase().replace(/^(ord-|pc-)/, "");
    const found = allOrders.find((o) => {
      const cleanId = o.id.toLowerCase().replace(/^ord-/, "");
      const cleanCode = o.display_code.toLowerCase().replace(/^pc-/, "");
      return (
        cleanId === cleanQuery ||
        cleanCode === cleanQuery ||
        o.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
        o.display_code.toLowerCase() === searchQuery.trim().toLowerCase()
      );
    });
    if (found) {
      setActiveOrder(found);
      setError(null);
    } else {
      // Try searching directly via API
      fetch(`${PUBLIC_API_BASE_URL}/orders/${encodeURIComponent(searchQuery.trim())}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((order: OrderDTO | null) => {
          if (order) {
            setActiveOrder(order);
            setError(null);
          } else {
            setError(`No order found matching "${searchQuery.trim()}". Please check your code.`);
          }
        })
        .catch(() => {
          setError(`No order found matching "${searchQuery.trim()}".`);
        });
    }
  }

  const currentStepIndex = activeOrder
    ? STATUS_STEPS.findIndex((s) => s.id === activeOrder.status)
    : 0;

  return (
    <main className="min-h-screen bg-[#0e0b08] pt-28 pb-24 text-linen selection:bg-saffron selection:text-espresso">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="text-center">
          <span className="rounded-full border border-saffron/40 bg-saffron/10 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.25em] text-saffron shadow-[0_0_15px_rgba(231,167,58,0.2)]">
            📍 Real-Time Order Tracking
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl italic text-linen">
            Track Your Feast
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-linen/70 font-light max-w-md mx-auto">
            Watch your order progress live from our iron tawa kitchen straight to your table or doorstep.
          </p>
        </div>

        {/* Search Bar for Order Lookup */}
        <form onSubmit={handleSearchSubmit} className="mt-8 relative max-w-lg mx-auto">
          <div className="relative flex items-center rounded-full border border-white/15 bg-[#14100b] p-1.5 shadow-2xl focus-within:border-saffron">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order Code (e.g. PC-1810 or ORD-123)"
              className="w-full bg-transparent px-5 py-2.5 font-body text-sm text-linen placeholder:text-linen/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-saffron px-6 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-espresso shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              Track 🔍
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 max-w-lg mx-auto rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* ACTIVE ORDER TRACKER CARD */}
        {activeOrder ? (
          <div className="mt-10 space-y-6">
            
            {/* Top Status Banner */}
            <div className="rounded-[2rem] border border-saffron/40 bg-gradient-to-br from-[#18120c] via-[#14100b] to-[#0e0b08] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-saffron/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-saffron animate-ping" />
                    <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-saffron">
                      Live Status: {STATUS_STEPS[currentStepIndex]?.label ?? activeOrder.status}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-3xl sm:text-4xl text-linen italic">
                    Order {activeOrder.display_code}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-widest text-linen/50 font-bold">
                    Channel / Table
                  </span>
                  <span className="mt-1 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 font-body text-xs font-bold uppercase tracking-wider text-saffron">
                    {activeOrder.channel === "online" ? "🛵 Online Order" : `🍽️ Table ${activeOrder.table_code}`}
                  </span>
                </div>
              </div>

              {/* Visual Progress Timeline */}
              <div className="mt-8">
                <ol className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label="Order Progress">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <li
                        key={step.id}
                        className={`relative rounded-2xl p-4 border transition-all duration-500 ${
                          isCurrent
                            ? "border-saffron bg-saffron/15 shadow-[0_0_20px_rgba(231,167,58,0.25)] scale-105"
                            : isDone
                            ? "border-saffron/40 bg-saffron/5 opacity-90"
                            : "border-white/5 bg-white/5 opacity-40"
                        }`}
                      >
                        <div className="text-2xl mb-2">{step.icon}</div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              isDone ? "bg-saffron shadow-[0_0_8px_rgba(231,167,58,0.8)]" : "bg-white/20"
                            }`}
                          />
                          <span className="font-body text-xs font-bold uppercase tracking-wider text-linen">
                            {step.label}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[10px] font-light text-linen/60 leading-relaxed">
                          {step.desc}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Estimated Time Indicator */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="font-body text-xs font-bold uppercase tracking-wider text-linen">
                      Estimated Preparation Time
                    </p>
                    <p className="text-xs text-linen/60">12 – 15 Minutes from placement</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadOrders}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-linen/80 hover:bg-white/10 transition-colors"
                  >
                    🔄 Refresh Status
                  </button>
                </div>
              </div>

              {/* Itemized Receipt */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="font-body text-xs font-bold uppercase tracking-[0.25em] text-saffron mb-4">
                  Order Details ({activeOrder.items.reduce((n, l) => n + l.quantity, 0)} Items)
                </h3>

                <ul className="space-y-3" role="list">
                  {activeOrder.items.map((item, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron/20 font-body text-xs font-bold text-saffron">
                          {item.quantity}×
                        </span>
                        <span className="truncate font-display text-lg text-linen">{item.name_snapshot}</span>
                      </div>
                      <span className="font-body text-sm font-semibold text-saffron">
                        {formatMoney(item.line_total)}
                      </span>
                    </li>
                  ))}
                </ul>

                {activeOrder.note && (
                  <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3 text-xs italic text-linen/70">
                    <span className="font-bold not-italic text-saffron uppercase tracking-widest text-[10px] block mb-1">
                      Kitchen Note:
                    </span>
                    &ldquo;{activeOrder.note}&rdquo;
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="font-body text-xs font-bold uppercase tracking-widest text-linen/60">
                    Total Amount Paid / Due
                  </span>
                  <span className="font-display text-2xl text-saffron font-bold">
                    {formatMoney(activeOrder.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
                <Link
                  href="/order?table=ONLINE&r=prince-corner-isanpur"
                  className="flex-1 rounded-full bg-saffron px-6 py-3 text-center font-body text-xs font-bold uppercase tracking-widest text-espresso shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  🍲 Order More Items
                </Link>
                <a
                  href="tel:+919876543210"
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-body text-xs font-bold uppercase tracking-widest text-linen hover:bg-white/10 transition-colors"
                >
                  📞 Call Kitchen
                </a>
              </div>

            </div>

          </div>
        ) : (
          /* Empty / No Order Found View */
          <div className="mt-12 rounded-[2rem] border border-dashed border-white/15 bg-[#14100b]/40 p-12 text-center">
            <span className="text-4xl">🧾</span>
            <h2 className="mt-4 font-display text-2xl italic text-linen">No Active Order Selected</h2>
            <p className="mt-2 text-xs text-linen/60 max-w-sm mx-auto">
              Place an order from our live menu or enter your Order Code (e.g. PC-1810) above to track status.
            </p>
            <Link
              href="/order?table=ONLINE&r=prince-corner-isanpur"
              className="mt-6 inline-block rounded-full bg-saffron px-8 py-3 font-body text-xs font-bold uppercase tracking-widest text-espresso shadow-lg transition-transform hover:scale-105"
            >
              Browse Menu &amp; Place Order ➔
            </Link>
          </div>
        )}

        {/* List of Previous Session Orders */}
        {allOrders.length > 1 && (
          <div className="mt-12 border-t border-white/10 pt-8">
            <h3 className="font-body text-xs font-bold uppercase tracking-[0.25em] text-linen/50 mb-4">
              All Recent Orders ({allOrders.length})
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {allOrders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setActiveOrder(ord)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    activeOrder?.id === ord.id
                      ? "border-saffron bg-saffron/15 shadow-md"
                      : "border-white/10 bg-[#14100b]/50 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-xs font-bold text-saffron uppercase tracking-widest">
                      {ord.display_code}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-linen/50">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-linen/70 truncate">
                    {ord.items.map((i) => `${i.quantity}x ${i.name_snapshot}`).join(", ")}
                  </p>
                  <span className="mt-2 block font-body text-xs font-semibold text-linen">
                    {formatMoney(ord.total)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <>
      <SiteNavbar />
      <Suspense fallback={<div className="min-h-screen bg-[#0e0b08] pt-32 text-center text-linen font-body text-xs uppercase tracking-widest">Loading Order Tracker...</div>}>
        <OrderTrackerContent />
      </Suspense>
      <LocationFooter />
    </>
  );
}
