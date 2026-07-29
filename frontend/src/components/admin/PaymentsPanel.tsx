"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/types";
import type { InvoiceDTO, OrderDTO, PaymentMethod, TableDTO } from "@/lib/types";

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

export function PaymentsPanel() {
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [tableId, setTableId] = useState<string>("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [loyaltyPhone, setLoyaltyPhone] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [invoice, setInvoice] = useState<InvoiceDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetch("/api/admin/tables")
      .then((r) => r.json())
      .then(setTables)
      .catch(() => {});
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  const table = tables.find((t) => t.id === tableId);
  const servedOrders = useMemo(
    () => orders.filter((o) => o.status === "served" && !o.is_billed && o.table_code === table?.code),
    [orders, table]
  );
  const inProgressOrders = useMemo(
    () => orders.filter((o) => o.status !== "served" && !o.is_billed && o.table_code === table?.code),
    [orders, table]
  );

  // Split by table: orders still cooking vs. orders actually ready to bill —
  // a table can be "occupied" without having anything billable yet.
  const tableActivity = useMemo(() => {
    const map = new Map<string, { ready: number; cooking: number }>();
    for (const o of orders) {
      if (o.is_billed) continue;
      const entry = map.get(o.table_code) ?? { ready: 0, cooking: 0 };
      if (o.status === "served") entry.ready += 1;
      else entry.cooking += 1;
      map.set(o.table_code, entry);
    }
    return map;
  }, [orders]);

  function toggleOrder(id: string) {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generateInvoice() {
    if (!tableId || selectedOrderIds.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tables/${tableId}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_ids: Array.from(selectedOrderIds),
          coupon_code: couponCode || undefined,
          loyalty_phone: loyaltyPhone || undefined,
          redeem_points: redeemPoints || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate the bill.");
        return;
      }
      setInvoice(data);
      setPaymentAmount(data.total);
    } finally {
      setBusy(false);
    }
  }

  async function recordPayment() {
    if (!invoice) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: paymentMethod, amount: paymentAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not record the payment.");
        return;
      }
      setInvoice(data);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setInvoice(null);
    setSelectedOrderIds(new Set());
    setCouponCode("");
    setLoyaltyPhone("");
    setRedeemPoints(0);
    setError(null);
    fetch("/api/orders").then((r) => r.json()).then(setOrders).catch(() => {});
  }

  return (
    <main aria-label="Payments">
      <h1 className="font-display text-3xl italic text-linen">Payments</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Pick a table, choose its served orders, generate the bill, and record
        how the guest paid — cash, card, UPI, or online via Razorpay.
      </p>

      {!invoice ? (
        <div className="mt-8 max-w-2xl space-y-6">
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.15em] text-linen/60">Tables</label>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {tables.filter((t) => t.is_active).map((t) => {
                const activity = tableActivity.get(t.code) ?? { ready: 0, cooking: 0 };
                const occupied = activity.ready > 0 || activity.cooking > 0;
                const isSelected = t.id === tableId;
                let badge = "Vacant";
                if (activity.ready > 0 && activity.cooking > 0) badge = `${activity.ready} ready · ${activity.cooking} cooking`;
                else if (activity.ready > 0) badge = `${activity.ready} ready to bill`;
                else if (activity.cooking > 0) badge = `${activity.cooking} cooking`;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTableId(t.id);
                      // Default to billing everything served for this sitting —
                      // staff can still uncheck individual orders to split the bill.
                      const servedIds = orders
                        .filter((o) => o.status === "served" && !o.is_billed && o.table_code === t.code)
                        .map((o) => o.id);
                      setSelectedOrderIds(new Set(servedIds));
                    }}
                    className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                      isSelected
                        ? "border-saffron bg-saffron/10"
                        : activity.ready > 0
                          ? "border-terracotta/40 bg-terracotta/5 hover:border-terracotta/70"
                          : activity.cooking > 0
                            ? "border-saffron/25 bg-saffron/5 hover:border-saffron/50"
                            : "border-linen/10 bg-[#221913] hover:border-linen/25"
                    }`}
                  >
                    <span className="block font-display text-lg italic text-linen">
                      {t.code.replace("T", "")}
                    </span>
                    <span
                      className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        activity.ready > 0 ? "text-terracotta" : occupied ? "text-saffron/80" : "text-linen/30"
                      }`}
                    >
                      {badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {tableId && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-linen/60">
                  Served orders for this table
                </p>
                {servedOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrderIds((prev) =>
                        prev.size === servedOrders.length ? new Set() : new Set(servedOrders.map((o) => o.id))
                      )
                    }
                    className="text-xs font-semibold text-saffron hover:underline"
                  >
                    {selectedOrderIds.size === servedOrders.length ? "Clear all" : "Select all"}
                  </button>
                )}
              </div>
              {servedOrders.length === 0 && inProgressOrders.length > 0 && (
                <p className="mt-2 text-sm text-saffron/90">
                  {inProgressOrders.length} order{inProgressOrders.length > 1 ? "s" : ""} still in the kitchen for
                  this table — mark them Served on Live Orders once they&apos;re out, then come back here to bill.
                </p>
              )}
              {servedOrders.length === 0 && inProgressOrders.length === 0 && (
                <p className="mt-2 text-sm text-linen/40">No served-but-unbilled orders on this table yet.</p>
              )}
              <div className="mt-2 space-y-2">
                {servedOrders.map((o) => (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-linen/10 bg-[#221913] px-4 py-3"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(o.id)}
                        onChange={() => toggleOrder(o.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-linen">{o.display_code}</span>
                      {o.channel === "online" && (
                        <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-saffron">
                          🛵 Online
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-saffron">{formatMoney(o.total)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedOrderIds.size > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.15em] text-linen/60">
                  Coupon code (optional)
                </label>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className={`${inputClasses} mt-1 w-full`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.15em] text-linen/60">
                  Loyalty phone (optional)
                </label>
                <input
                  value={loyaltyPhone}
                  onChange={(e) => setLoyaltyPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className={`${inputClasses} mt-1 w-full`}
                />
              </div>
              {loyaltyPhone && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-[0.15em] text-linen/60">
                    Redeem points
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Math.max(0, Number(e.target.value)))}
                    className={`${inputClasses} mt-1 w-full`}
                  />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div>
            <button
              onClick={generateInvoice}
              disabled={busy || selectedOrderIds.size === 0}
              className="rounded-full bg-saffron px-6 py-2.5 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Generating…" : "Generate bill"}
            </button>
            {tableId && selectedOrderIds.size === 0 && servedOrders.length > 0 && (
              <p className="mt-2 text-xs text-linen/40">Check at least one order above to enable this.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 max-w-xl rounded-3xl border border-linen/10 bg-[#221913] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl italic text-linen">Bill — Table {table?.code.replace("T", "")}</h2>
            <span className="rounded-full bg-saffron/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-saffron">
              {invoice.status}
            </span>
          </div>

          <ul className="mt-4 space-y-1 text-sm text-linen/80">
            {invoice.orders.map((o) => (
              <li key={o.id} className="flex justify-between">
                <span>{o.display_code}</span>
                <span>{formatMoney(o.total)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 border-t border-linen/10 pt-4 text-sm">
            <div className="flex justify-between text-linen/60">
              <dt>Subtotal</dt>
              <dd>{formatMoney(invoice.subtotal)}</dd>
            </div>
            {Number(invoice.discount_amount) > 0 && (
              <div className="flex justify-between text-sage">
                <dt>Discount ({invoice.coupon_code})</dt>
                <dd>-{formatMoney(invoice.discount_amount)}</dd>
              </div>
            )}
            {Number(invoice.loyalty_redeemed_amount) > 0 && (
              <div className="flex justify-between text-sage">
                <dt>Loyalty redeemed</dt>
                <dd>-{formatMoney(invoice.loyalty_redeemed_amount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-linen/60">
              <dt>Tax ({invoice.tax_rate}%)</dt>
              <dd>{formatMoney(invoice.tax_amount)}</dd>
            </div>
            <div className="flex justify-between text-lg font-semibold text-linen">
              <dt>Total</dt>
              <dd>{formatMoney(invoice.total)}</dd>
            </div>
            <div className="flex justify-between text-linen/40">
              <dt>Paid so far</dt>
              <dd>{formatMoney(invoice.amount_paid)}</dd>
            </div>
          </dl>

          {invoice.status !== "paid" && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-linen/10 pt-4">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className={inputClasses}
              >
                <option value="cash">Cash</option>
                <option value="card">Card (at counter)</option>
                <option value="upi">UPI (at counter)</option>
              </select>
              <input
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className={`${inputClasses} w-28`}
              />
              <button
                onClick={recordPayment}
                disabled={busy}
                className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                Record payment
              </button>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            onClick={reset}
            className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-linen/50 hover:text-linen"
          >
            ← Bill another table
          </button>
        </div>
      )}
    </main>
  );
}
