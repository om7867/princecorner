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
    <section aria-label="Your bill" className="mt-6 rounded-[2rem] border border-saffron/20 bg-gradient-to-b from-[#14100b] to-[#0e0b08] p-6 shadow-2xl">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl italic text-linen">Receipt</h2>
        <span className="rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-saffron">
          {invoice.status}
        </span>
      </div>

      <ul className="mt-4 space-y-2 font-body text-sm text-linen/70">
        {invoice.orders.map((o) => (
          <li key={o.id} className="flex justify-between items-end gap-2">
            <span>Order {o.display_code}</span>
            <div className="flex-grow border-b border-dotted border-white/10 mb-1.5 mx-2" />
            <span className="font-semibold text-saffron">{formatMoney(o.total)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 border-t border-white/10 pt-4 font-body text-sm">
        {Number(invoice.discount_amount) > 0 && (
          <div className="flex justify-between items-end text-sage">
            <dt className="uppercase tracking-widest text-[10px]">Discount</dt>
            <div className="flex-grow border-b border-dotted border-sage/20 mb-1 mx-2" />
            <dd>-{formatMoney(invoice.discount_amount)}</dd>
          </div>
        )}
        <div className="flex justify-between items-end text-linen/50">
          <dt className="uppercase tracking-widest text-[10px]">Tax</dt>
          <div className="flex-grow border-b border-dotted border-white/5 mb-1 mx-2" />
          <dd>{formatMoney(invoice.tax_amount)}</dd>
        </div>
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5 text-lg font-display text-linen">
          <dt className="italic">Total</dt>
          <dd className="font-body font-bold text-saffron">{formatMoney(invoice.total)}</dd>
        </div>
      </dl>

      {error && (
        <p role="alert" className="mt-4 text-center text-xs font-semibold uppercase tracking-wider text-terracotta">
          {error}
        </p>
      )}

      {invoice.status === "paid" ? (
        <div className="mt-6 text-center">
          <p className="font-body text-xs font-bold uppercase tracking-widest text-sage border border-sage/20 bg-sage/5 rounded-full py-2 inline-block px-6 mb-4">
            ✓ Paid — thank you!
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className="block w-full rounded-full border border-white/10 bg-white/5 py-4 font-body text-xs font-semibold uppercase tracking-widest text-linen hover:bg-white/10 transition-colors"
          >
            Back to menu
          </button>
        </div>
      ) : razorpayEnabled ? (
        <button
          onClick={payOnline}
          disabled={paying}
          className="mt-6 w-full rounded-full bg-saffron py-4 font-body text-xs font-bold uppercase tracking-widest text-espresso shadow-[0_5px_20px_rgba(231,167,58,0.3)] transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
        >
          {paying ? "Opening gateway…" : `Pay ${formatMoney(remaining)} online`}
        </button>
      ) : (
        <>
          <button
            onClick={() => setDemoOpen(true)}
            className="mt-6 w-full rounded-full bg-saffron py-4 font-body text-xs font-bold uppercase tracking-widest text-espresso shadow-[0_5px_20px_rgba(231,167,58,0.3)] transition-transform active:scale-[0.98]"
          >
            Pay {formatMoney(remaining)} online
          </button>
          <p className="mt-4 text-center font-body text-[10px] leading-relaxed text-linen/30 max-w-xs mx-auto">
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
