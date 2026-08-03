"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/types";
import { useGlobalCart } from "@/hooks/useGlobalCart";

export function FloatingCartPill() {
  const { totalItems, totalPrice, toastMessage } = useGlobalCart();
  const [showPill, setShowPill] = useState(false);

  // Animate pill in/out
  useEffect(() => {
    if (totalItems > 0) {
      const t = setTimeout(() => setShowPill(true), 100);
      return () => clearTimeout(t);
    } else {
      setShowPill(false);
    }
  }, [totalItems]);

  return (
    <>
      {/* Toast Notification — Mobile Optimized */}
      {toastMessage && (
        <div
          className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-[60]"
          style={{
            animation: "slideDown 0.35s cubic-bezier(.16,1,.3,1), fadeOut 0.4s 2.4s ease forwards",
          }}
        >
          <div className="rounded-2xl border border-saffron/50 bg-[#14100b]/97 px-4 py-3 text-xs font-bold text-saffron shadow-[0_8px_30px_rgba(231,167,58,0.25)] backdrop-blur-xl flex items-center gap-3">
            <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-saffron text-espresso text-sm shadow-md">
              ✓
            </span>
            <span className="text-[11px] leading-snug">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Pill — Mobile First */}
      {totalItems > 0 && (
        <div
          className="fixed bottom-4 sm:bottom-6 inset-x-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none"
          style={{
            transform: showPill ? "translateY(0)" : "translateY(120%)",
            opacity: showPill ? 1 : 0,
            transition: "transform 0.4s cubic-bezier(.16,1,.3,1), opacity 0.3s ease",
          }}
        >
          <Link
            href="/cart"
            className="pointer-events-auto w-full max-w-md rounded-2xl border border-saffron/50 bg-[#0e0b08]/97 px-4 sm:px-6 py-3 text-linen shadow-[0_10px_40px_rgba(231,167,58,0.35)] backdrop-blur-xl flex items-center justify-between gap-3 active:scale-[0.97] transition-transform"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron text-espresso font-bold text-sm shadow-md">
                {totalItems}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-saffron truncate">
                  Your Order
                </p>
                <p className="text-sm font-bold text-linen">
                  {formatMoney(totalPrice)}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-saffron px-4 py-2.5 font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest text-espresso shadow-lg">
              Checkout ➔
            </div>
          </Link>
        </div>
      )}

      {/* Keyframe styles injected inline */}
      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </>
  );
}
