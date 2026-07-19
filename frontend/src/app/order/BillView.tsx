"use client";

import { useState } from "react";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { loadRazorpayScript } from "@/lib/razorpay";
import { formatMoney } from "@/lib/types";
import type { InvoiceDTO } from "@/lib/types";
import { DemoCardModal } from "@/components/order/DemoCardModal";

export function BillView({
  invoice,
  restaurantName,
  razorpayEnabled,
  onInvoiceUpdate,
  onDismiss,
}: {
  invoice: InvoiceDTO;
  restaurantName: string;
  razorpayEnabled: boolean;
  onInvoiceUpdate: (invoice: InvoiceDTO) => void;
  onDismiss: () => void;
}) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  const remaining = Number(invoice.total) - Number(invoice.amount_paid);

  async function payOnline() {
    setPaying(true);
    setError(null);
    try {
      const orderRes = await fetch(`${PUBLIC_API_BASE_URL}/invoices/${invoice.id}/razorpay-order`, {
        method: "POST",
      });
      if (!orderRes.ok) {
        setError("Couldn't start the payment — please pay at the counter.");
        return;
      }
      const { razorpay_order_id, amount_paise, key_id } = await orderRes.json();

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Couldn't load the payment window — please pay at the counter.");
        return;
      }

      const rzp = new window.Razorpay({
        key: key_id,
        amount: amount_paise,
        currency: "INR",
        order_id: razorpay_order_id,
        name: restaurantName,
        theme: { color: "#e7a73a" },
        handler: async (response) => {
          const verifyRes = await fetch(`${PUBLIC_API_BASE_URL}/invoices/${invoice.id}/razorpay-verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            onInvoiceUpdate(await verifyRes.json());
          } else {
            setError("Payment could not be verified — please check with your server.");
          }
        },
      });
      rzp.open();
    } finally {
      setPaying(false);
    }
  }

  async function submitDemoPayment(): Promise<boolean> {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/invoices/${invoice.id}/demo-pay`, { method: "POST" });
      if (!res.ok) return false;
      onInvoiceUpdate(await res.json());
      return true;
    } catch {
      return false;
    }
  }

  return (
    <section aria-label="Your bill" className="mt-4 rounded-2xl border-2 border-saffron/60 bg-linen-soft p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg italic text-espresso">Your bill</h2>
        <span className="rounded-full bg-saffron/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-terracotta">
          {invoice.status}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-espresso/80">
        {invoice.orders.map((o) => (
          <li key={o.id} className="flex justify-between">
            <span>{o.display_code}</span>
            <span>{formatMoney(o.total)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-3 space-y-1 border-t border-espresso/10 pt-3 text-sm">
        {Number(invoice.discount_amount) > 0 && (
          <div className="flex justify-between text-sage">
            <dt>Discount</dt>
            <dd>-{formatMoney(invoice.discount_amount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-espresso/60">
          <dt>Tax</dt>
          <dd>{formatMoney(invoice.tax_amount)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold text-espresso">
          <dt>Total</dt>
          <dd>{formatMoney(invoice.total)}</dd>
        </div>
      </dl>

      {error && (
        <p role="alert" className="mt-3 text-sm text-terracotta">
          {error}
        </p>
      )}

      {invoice.status === "paid" ? (
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-sage">✓ Paid — thank you!</p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-espresso/50 underline-offset-2 hover:text-espresso hover:underline"
          >
            Back to menu
          </button>
        </div>
      ) : razorpayEnabled ? (
        <button
          onClick={payOnline}
          disabled={paying}
          className="mt-4 w-full rounded-full bg-terracotta py-3 font-body text-sm font-semibold text-linen transition-transform active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
        >
          {paying ? "Opening payment…" : `Pay ${formatMoney(remaining)} online`}
        </button>
      ) : (
        <>
          <button
            onClick={() => setDemoOpen(true)}
            className="mt-4 w-full rounded-full bg-terracotta py-3 font-body text-sm font-semibold text-linen transition-transform active:scale-[0.99]"
          >
            Pay {formatMoney(remaining)} online
          </button>
          <p className="mt-2 text-center text-[11px] text-espresso/40">
            Demo checkout — no real payment gateway connected yet. Or pay at the counter.
          </p>
        </>
      )}

      {demoOpen && (
        <DemoCardModal
          restaurantName={restaurantName}
          amountLabel={formatMoney(remaining)}
          onClose={() => setDemoOpen(false)}
          onSubmit={async () => {
            const ok = await submitDemoPayment();
            if (ok) setDemoOpen(false);
            return ok;
          }}
        />
      )}
    </section>
  );
}
