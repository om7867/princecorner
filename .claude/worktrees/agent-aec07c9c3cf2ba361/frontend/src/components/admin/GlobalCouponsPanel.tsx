"use client";

import { useEffect, useState } from "react";

type GlobalCouponType = "flat" | "percentage" | "bogo";

type GlobalCouponDTO = {
  id: string;
  organization_id: string;
  code: string;
  type: GlobalCouponType;
  value: string;
  min_order_amount: string;
  max_discount: string | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

export function GlobalCouponsPanel() {
  const [coupons, setCoupons] = useState<GlobalCouponDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<GlobalCouponType>("percentage");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  function load() {
    fetch("/api/admin/org/coupons")
      .then((r) => r.json())
      .then((data) => {
        setCoupons(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, []);

  async function createCoupon() {
    if (!code.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/org/coupons", {
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
        setNote(`Pushed "${code.toUpperCase()}" to every active branch.`);
        setCode("");
        setValue("10");
        setMinOrder("0");
        setMaxDiscount("");
        setExpiresAt("");
        setUsageLimit("");
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: GlobalCouponDTO) {
    const res = await fetch(`/api/admin/org/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    if (res.ok) load();
  }

  async function patchValue(coupon: GlobalCouponDTO, value: string) {
    if (value === coupon.value) return;
    const res = await fetch(`/api/admin/org/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      setNote("Re-pushed the update to every active branch.");
      load();
    }
  }

  return (
    <main aria-label="Global Coupons">
      <h1 className="font-display text-3xl italic text-linen">Global Coupons</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        A chain-wide master coupon list. Every coupon you add or edit here is
        pushed to a matching coupon in every active branch — branch admins
        can still disable a chain coupon locally at their location.
      </p>
      {note && <p className="mt-2 text-xs text-sage">{note}</p>}

      <div className="mt-8 grid gap-3 rounded-3xl border border-linen/10 bg-[#221913] p-6 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CODE"
          className={inputClasses}
        />
        <select value={type} onChange={(e) => setType(e.target.value as GlobalCouponType)} className={inputClasses}>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat amount</option>
          <option value="bogo">BOGO (cheapest free)</option>
        </select>
        {type !== "bogo" && (
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className={inputClasses} />
        )}
        <input
          value={minOrder}
          onChange={(e) => setMinOrder(e.target.value)}
          placeholder="Min order"
          className={inputClasses}
        />
        {type === "percentage" && (
          <input
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="Max discount"
            className={inputClasses}
          />
        )}
        <div>
          <label htmlFor="global-coupon-expiry" className="mb-0.5 block text-[10px] uppercase tracking-[0.15em] text-linen/40">
            Expires (optional)
          </label>
          <input
            id="global-coupon-expiry"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={`${inputClasses} w-full [color-scheme:dark]`}
          />
        </div>
        <div>
          <label htmlFor="global-coupon-limit" className="mb-0.5 block text-[10px] uppercase tracking-[0.15em] text-linen/40">
            Usage limit (optional)
          </label>
          <input
            id="global-coupon-limit"
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
          disabled={saving}
          className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          + Add coupon
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && coupons.length === 0 && <p className="text-sm text-linen/40">No global coupons yet.</p>}
        {coupons.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linen/10 bg-[#221913] p-4"
          >
            <div>
              <p className="font-display text-lg italic text-linen">{c.code}</p>
              <p className="text-xs text-linen/50">
                {c.type === "percentage" &&
                  `${c.value}% off, min $${c.min_order_amount}${c.max_discount ? `, capped at $${c.max_discount}` : ""}`}
                {c.type === "flat" && `$${c.value} off, min $${c.min_order_amount}`}
                {c.type === "bogo" && `BOGO — cheapest item free, min $${c.min_order_amount}`}
                {c.usage_limit ? ` · limit ${c.usage_limit} uses per branch` : ""}
                {c.expires_at ? ` · expires ${c.expires_at.slice(0, 10)}` : ""}
              </p>
              {c.type !== "bogo" && (
                <input
                  defaultValue={c.value}
                  onBlur={(e) => patchValue(c, e.target.value)}
                  className={`${inputClasses} mt-1 w-24`}
                  aria-label={`Value for ${c.code}`}
                />
              )}
            </div>
            <button
              onClick={() => toggleActive(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                c.is_active ? "bg-sage/15 text-sage" : "bg-linen/10 text-linen/50"
              }`}
            >
              {c.is_active ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
