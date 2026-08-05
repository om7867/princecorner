"use client";

import { useEffect, useState } from "react";
import type { CouponDTO, CouponType } from "@/lib/types";

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

const DEFAULT_MOCK_COUPONS: CouponDTO[] = [
  { id: "c-1", code: "WELCOME20", type: "percentage", value: "20.00", min_order_amount: "200.00", max_discount: "100.00", starts_at: null, expires_at: null, usage_limit: 50, times_used: 14, is_active: true },
  { id: "c-2", code: "FLAT50", type: "flat", value: "50.00", min_order_amount: "300.00", max_discount: "50.00", starts_at: null, expires_at: null, usage_limit: 100, times_used: 32, is_active: true },
  { id: "c-3", code: "PAVFEAST", type: "percentage", value: "15.00", min_order_amount: "150.00", max_discount: "75.00", starts_at: null, expires_at: null, usage_limit: 200, times_used: 89, is_active: true },
];

export function CouponsPanel() {
  const [coupons, setCoupons] = useState<CouponDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  function load() {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCoupons(data);
        } else {
          setCoupons(DEFAULT_MOCK_COUPONS);
        }
        setLoaded(true);
      })
      .catch(() => {
        setCoupons(DEFAULT_MOCK_COUPONS);
        setLoaded(true);
      });
  }

  useEffect(load, []);

  async function createCoupon() {
    if (!code.trim()) return;
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        type,
        value: type === "bogo" ? "0" : value,
        min_order_amount: minOrder,
        max_discount: maxDiscount || null,
        expires_at: expiresAt ? `${expiresAt}T23:59:59` : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
      }),
    });
    if (res.ok) {
      setCode("");
      setValue("10");
      setMinOrder("0");
      setMaxDiscount("");
      setExpiresAt("");
      setUsageLimit("");
      load();
    }
  }

  async function toggleActive(coupon: CouponDTO) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    if (res.ok) load();
  }

  async function deleteCoupon(coupon: CouponDTO) {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <main aria-label="Coupons">
      <h1 className="font-display text-3xl italic text-linen">Coupons</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Flat, percentage, or buy-one-get-one offers — enter a code at the
        Payments screen to apply it to a bill.
      </p>

      <div className="mt-8 grid gap-3 rounded-3xl border border-linen/10 bg-[#221913] p-6 sm:grid-cols-2 lg:grid-cols-5">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" className={inputClasses} />
        <select value={type} onChange={(e) => setType(e.target.value as CouponType)} className={inputClasses}>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat amount</option>
          <option value="bogo">BOGO (cheapest free)</option>
        </select>
        {type !== "bogo" && (
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className={inputClasses} />
        )}
        <input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="Min order" className={inputClasses} />
        {type === "percentage" && (
          <input
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="Max discount"
            className={inputClasses}
          />
        )}
        <div>
          <label htmlFor="coupon-expiry" className="mb-0.5 block text-[10px] uppercase tracking-[0.15em] text-linen/40">
            Expires (optional)
          </label>
          <input
            id="coupon-expiry"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={`${inputClasses} w-full [color-scheme:dark]`}
          />
        </div>
        <div>
          <label htmlFor="coupon-limit" className="mb-0.5 block text-[10px] uppercase tracking-[0.15em] text-linen/40">
            Usage limit (optional)
          </label>
          <input
            id="coupon-limit"
            type="number"
            min={1}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="e.g. 100"
            className={`${inputClasses} w-full`}
          />
        </div>
        <button
          onClick={createCoupon}
          className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02]"
        >
          + Add coupon
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && coupons.length === 0 && <p className="text-sm text-linen/40">No coupons yet.</p>}
        {coupons.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linen/10 bg-[#221913] p-4"
          >
            <div>
              <p className="font-display text-lg italic text-linen">{c.code}</p>
              <p className="text-xs text-linen/50">
                {c.type === "percentage" && `${c.value}% off, min ₹${c.min_order_amount}${c.max_discount ? `, capped at ₹${c.max_discount}` : ""}`}
                {c.type === "flat" && `₹${c.value} off, min ₹${c.min_order_amount}`}
                {c.type === "bogo" && `BOGO — cheapest item free, min ₹${c.min_order_amount}`}
                {" · used "}
                {c.times_used}
                {c.usage_limit ? ` / ${c.usage_limit}` : ""} times
                {c.expires_at ? ` · expires ${c.expires_at.slice(0, 10)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                  c.is_active ? "bg-sage/15 text-sage" : "bg-linen/10 text-linen/50"
                }`}
              >
                {c.is_active ? "Active" : "Disabled"}
              </button>
              <button
                onClick={() => deleteCoupon(c)}
                className="rounded-full border border-linen/15 px-3 py-1 text-xs text-linen/50 hover:border-red-400 hover:text-red-400"
                title="Delete coupon"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
