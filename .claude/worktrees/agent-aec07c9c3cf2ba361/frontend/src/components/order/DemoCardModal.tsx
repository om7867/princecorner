"use client";

import { useState } from "react";

/** Fake Razorpay-Checkout-shaped card modal for demoing the pay-online
 * experience to clients before real gateway keys exist. `onSubmit` does the
 * actual (demo) charge server-side; this component only owns the UI beats. */
export function DemoCardModal({
  restaurantName,
  amountLabel,
  onClose,
  onSubmit,
}: {
  restaurantName: string;
  amountLabel: string;
  onClose: () => void;
  onSubmit: () => Promise<boolean>;
}) {
  const [stage, setStage] = useState<"form" | "processing" | "error">("form");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvv, setCvv] = useState("123");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStage("processing");
    // A short artificial delay so the demo reads like a real charge going
    // through, rather than snapping straight to success.
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const ok = await onSubmit();
    if (!ok) setStage("error");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Demo checkout"
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl bg-linen p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              Sandbox · no real charge
            </p>
            <h2 className="mt-1 font-display text-lg italic text-espresso">{restaurantName}</h2>
          </div>
          {stage !== "processing" && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-1.5 text-espresso/50 transition-colors hover:text-espresso"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {stage === "processing" ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
            <p className="mt-4 text-sm text-espresso/70">Processing payment…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="demo-card" className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-espresso/60">
                Card number
              </label>
              <input
                id="demo-card"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                className="w-full rounded-xl border border-espresso/15 bg-white/60 px-4 py-3 text-sm text-espresso focus:border-terracotta focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="demo-expiry" className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-espresso/60">
                  Expiry
                </label>
                <input
                  id="demo-expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full rounded-xl border border-espresso/15 bg-white/60 px-4 py-3 text-sm text-espresso focus:border-terracotta focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="demo-cvv" className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-espresso/60">
                  CVV
                </label>
                <input
                  id="demo-cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full rounded-xl border border-espresso/15 bg-white/60 px-4 py-3 text-sm text-espresso focus:border-terracotta focus:outline-none"
                />
              </div>
            </div>

            {stage === "error" && (
              <p role="alert" className="text-sm text-terracotta">
                Something went wrong — please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-terracotta py-3 font-body text-sm font-semibold text-linen transition-transform active:scale-[0.99]"
            >
              Pay {amountLabel}
            </button>
            <p className="text-center text-[10px] text-espresso/40">
              Any details work here — this simulates a successful charge for demo purposes.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
