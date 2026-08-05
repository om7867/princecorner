"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/types";
import type { CategoryDTO, MenuItemDTO, TableDTO } from "@/lib/types";
import { ThermalBillModal, PrintableBillData } from "./ThermalBillModal";

type CartLine = {
  item: MenuItemDTO;
  variantName?: string;
  variantPrice?: number;
  selectedAddons: Array<{ name: string; price: number }>;
  quantity: number;
};

export function POSModal({ onClose, onOrderCreated }: { onClose: () => void; onOrderCreated?: () => void }) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Order details
  const [channel, setChannel] = useState<"dine_in" | "online">("dine_in");
  const [selectedTableCode, setSelectedTableCode] = useState<string>("T1");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  
  // Cart & Discounts
  const [cart, setCart] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card">("cash");
  const [cashTendered, setCashTendered] = useState<string>("");

  // States
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billModalData, setBillModalData] = useState<PrintableBillData | null>(null);

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((data: MenuItemDTO[]) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/public/menu/categories")
      .then((r) => r.json())
      .then((cats: CategoryDTO[]) => setCategories(Array.isArray(cats) ? cats : []))
      .catch(() => {});

    fetch("/api/admin/tables")
      .then((r) => r.json())
      .then((tbls: TableDTO[]) => setTables(Array.isArray(tbls) ? tbls : []))
      .catch(() => {});
  }, []);

  // Loyalty lookup
  async function lookupLoyalty() {
    if (!customerPhone.trim()) return;
    try {
      const res = await fetch(`/api/admin/loyalty/${encodeURIComponent(customerPhone.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setLoyaltyPoints(data.points);
          if (data.name) setCustomerName(data.name);
        } else {
          setLoyaltyPoints(0);
        }
      }
    } catch {
      setLoyaltyPoints(0);
    }
  }

  function addToCart(item: MenuItemDTO) {
    setCart((prev) => {
      const existingIdx = prev.findIndex((line) => line.item.id === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { item, selectedAddons: [], quantity: 1 }];
    });
  }

  function updateQty(index: number, delta: number) {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  }

  // Calculations
  const subtotal = cart.reduce((acc, line) => {
    const base = line.variantPrice ?? Number(line.item.base_price);
    const addonsTotal = line.selectedAddons.reduce((a, addon) => a + addon.price, 0);
    return acc + (base + addonsTotal) * line.quantity;
  }, 0);

  const taxAmount = (subtotal - discountAmount) * 0.05; // 5% GST
  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  const changeReturned = Number(cashTendered) > grandTotal ? Number(cashTendered) - grandTotal : 0;

  async function applyCoupon() {
    if (!couponCode.trim() || subtotal <= 0) return;
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const coupons = await res.json();
        const found = coupons.find((c: any) => c.code === couponCode.trim().toUpperCase() && c.is_active);
        if (found) {
          if (found.type === "percentage") {
            const val = (subtotal * Number(found.value)) / 100;
            setDiscountAmount(found.max_discount ? Math.min(val, Number(found.max_discount)) : val);
          } else {
            setDiscountAmount(Number(found.value));
          }
        } else {
          setError("Invalid coupon code");
        }
      }
    } catch {
      setError("Failed to apply coupon");
    }
  }

  async function checkoutAndPrint() {
    if (cart.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const displayCode = `POS-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Create order
      const orderLines = cart.map((line) => ({
        menu_item_id: line.item.id,
        quantity: line.quantity,
        name: line.item.name,
        unit_price: line.variantPrice ?? line.item.base_price,
      }));

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          table: selectedTableCode,
          table_code: selectedTableCode,
          lines: orderLines,
          items: orderLines,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        setError(data.error ?? "Failed to create POS order.");
        return;
      }

      const orderData = await orderRes.json();
      const orderId = orderData.id;

      // 2. Advance order to served for immediate billing
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "served" }),
      });

      // 3. Prepare printable bill data
      const billData: PrintableBillData = {
        displayCode: orderData.display_code || displayCode,
        tableCode: selectedTableCode,
        channel: channel === "dine_in" ? "Dine-In" : "Takeaway / Online",
        createdAt: new Date().toISOString(),
        cashierName: "Head Cashier",
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: cart.map((line) => ({
          name: line.item.name,
          variantName: line.variantName,
          quantity: line.quantity,
          unitPrice: line.variantPrice ?? Number(line.item.base_price),
          lineTotal: (line.variantPrice ?? Number(line.item.base_price)) * line.quantity,
        })),
        subtotal,
        discountAmount,
        couponCode: couponCode || undefined,
        taxAmount,
        total: grandTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        amountTendered: cashTendered ? Number(cashTendered) : grandTotal,
        changeAmount: changeReturned,
        earnedPoints: Math.floor(grandTotal / 10), // 1 point per 10 rs
      };

      setBillModalData(billData);
      onOrderCreated?.();
    } catch {
      setError("An error occurred during POS checkout.");
    } finally {
      setBusy(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-6 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-linen/20 bg-[#17110d] text-linen shadow-2xl">
        
        {/* POS Top Bar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linen/10 bg-[#120d0a] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron text-xl text-espresso">
              🖥️
            </span>
            <div>
              <h2 className="font-display text-2xl italic text-linen">Prince Corner POS Terminal</h2>
              <p className="text-xs text-linen/50">Quick Counter Billing, Thermal Receipt &amp; Loyalty Integration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCart([]);
                setCustomerPhone("");
                setCustomerName("");
                setLoyaltyPoints(null);
              }}
              className="rounded-xl border border-linen/15 px-4 py-2 text-xs font-semibold text-linen/70 transition-colors hover:border-saffron hover:text-saffron"
            >
              Clear POS
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-linen/10 px-4 py-2 text-xs font-semibold text-linen transition-colors hover:bg-linen/20"
            >
              Close POS (ESC)
            </button>
          </div>
        </div>

        {/* POS Body: 2 Columns */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          
          {/* Left Column: Menu Catalog (7 Cols) */}
          <div className="flex flex-col border-r border-linen/10 bg-[#1b140f] p-4 lg:col-span-7 overflow-y-auto">
            
            {/* Search & Categories */}
            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search items by name (e.g. Dosa, Paneer, Pizza)..."
                className="w-full rounded-2xl border border-linen/15 bg-espresso/60 px-4 py-3 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none"
              />

              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    selectedCategory === "all" ? "bg-saffron text-espresso" : "bg-linen/10 text-linen/70 hover:bg-linen/15"
                  }`}
                >
                  All Items ({items.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      selectedCategory === cat.id ? "bg-saffron text-espresso" : "bg-linen/10 text-linen/70 hover:bg-linen/15"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="mt-4 grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 overflow-y-auto pr-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="flex flex-col justify-between rounded-2xl border border-linen/10 bg-[#241c16] p-3 text-left transition-all hover:border-saffron/50 hover:bg-[#2c221a] active:scale-95"
                >
                  <div>
                    <span className="font-display text-base font-semibold text-linen">{item.name}</span>
                    <p className="mt-1 line-clamp-2 text-[11px] text-linen/50">{item.description || "Freshly cooked to order"}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-linen/10 pt-2">
                    <span className="font-body text-sm font-bold text-saffron">{formatMoney(item.base_price)}</span>
                    <span className="rounded-full bg-saffron/15 px-2.5 py-1 text-[10px] font-bold text-saffron">+ ADD</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary, Customer Loyalty & Billing (5 Cols) */}
          <div className="flex flex-col bg-[#140e0b] p-4 lg:col-span-5 overflow-y-auto">
            
            {/* Channel & Table Picker */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-linen/10 bg-espresso/50 p-2">
              <button
                type="button"
                onClick={() => setChannel("dine_in")}
                className={`rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  channel === "dine_in" ? "bg-saffron text-espresso" : "text-linen/60 hover:text-linen"
                }`}
              >
                🍽️ Dine-in
              </button>
              <button
                type="button"
                onClick={() => setChannel("online")}
                className={`rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  channel === "online" ? "bg-saffron text-espresso" : "text-linen/60 hover:text-linen"
                }`}
              >
                🛵 Counter / Takeaway
              </button>
            </div>

            {channel === "dine_in" && (
              <div className="mt-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-linen/40">Select Table</label>
                <select
                  value={selectedTableCode}
                  onChange={(e) => setSelectedTableCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/60 px-3 py-2 text-sm text-saffron font-bold focus:border-saffron focus:outline-none"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.code}>
                      Table {t.code}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer & Loyalty Lookup */}
            <div className="mt-3 rounded-2xl border border-linen/10 bg-espresso/40 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-linen/40">Customer &amp; Loyalty</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Customer Phone (e.g. 9876543210)"
                  className="flex-1 rounded-xl border border-linen/15 bg-black/30 px-3 py-1.5 text-xs text-linen placeholder:text-linen/30 focus:border-saffron focus:outline-none"
                />
                <button
                  type="button"
                  onClick={lookupLoyalty}
                  className="rounded-xl border border-saffron/30 bg-saffron/10 px-3 py-1.5 text-xs font-bold text-saffron hover:bg-saffron hover:text-espresso"
                >
                  Lookup
                </button>
              </div>

              {loyaltyPoints !== null && (
                <div className="mt-2 flex items-center justify-between text-xs text-sage">
                  <span>Customer Points: <strong>{loyaltyPoints} pts</strong></span>
                  <span className="text-[10px] text-linen/40">Earns +{Math.floor(grandTotal / 10)} pts on bill</span>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="mt-3 flex-1 overflow-y-auto rounded-2xl border border-linen/10 bg-espresso/20 p-3">
              {cart.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-center text-linen/40">
                  <span className="text-3xl">🛒</span>
                  <p className="mt-1 text-xs">POS Cart is empty — click items to add</p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {cart.map((line, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded-xl bg-linen/5 p-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-linen">{line.item.name}</p>
                        <p className="text-[10px] text-saffron">{formatMoney(line.item.base_price)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(idx, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-linen/10 text-xs font-bold hover:bg-linen/20"
                        >
                          -
                        </button>
                        <span className="font-bold text-linen">{line.quantity}</span>
                        <button
                          onClick={() => updateQty(idx, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-linen/10 text-xs font-bold hover:bg-linen/20"
                        >
                          +
                        </button>
                        <span className="w-14 text-right font-bold text-saffron">
                          {formatMoney(Number(line.item.base_price) * line.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon Code (e.g. PRINCE20)"
                className="flex-1 rounded-xl border border-linen/15 bg-espresso/50 px-3 py-1.5 text-xs text-linen placeholder:text-linen/30 focus:border-saffron focus:outline-none"
              />
              <button
                onClick={applyCoupon}
                className="rounded-xl border border-linen/20 px-3 py-1.5 text-xs font-bold text-linen hover:border-saffron hover:text-saffron"
              >
                Apply
              </button>
            </div>

            {error && <p className="mt-2 text-center text-xs font-bold text-red-400">{error}</p>}

            {/* Calculation Totals */}
            <div className="mt-3 space-y-1.5 rounded-2xl border border-linen/10 bg-espresso/60 p-3 text-xs">
              <div className="flex justify-between text-linen/70">
                <span>Subtotal:</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sage font-semibold">
                  <span>Discount:</span>
                  <span>-{formatMoney(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-linen/50 text-[11px]">
                <span>GST Tax (5%):</span>
                <span>{formatMoney(taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-linen/10 pt-2 font-display text-lg font-bold text-saffron">
                <span>Total Payable:</span>
                <span>{formatMoney(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-linen/10 bg-espresso/50 p-1">
                {(["cash", "upi", "card"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`rounded-lg py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      paymentMethod === m ? "bg-saffron text-espresso" : "text-linen/60 hover:text-linen"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {paymentMethod === "cash" && (
                <div className="flex items-center gap-2 rounded-xl bg-linen/5 p-2">
                  <span className="text-[11px] text-linen/60">Cash Received:</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={String(Math.ceil(grandTotal))}
                    className="w-24 rounded-lg border border-linen/15 bg-black/40 px-2 py-1 text-xs text-saffron font-bold focus:border-saffron focus:outline-none"
                  />
                  {changeReturned > 0 && (
                    <span className="ml-auto text-[11px] font-bold text-sage">
                      Change: {formatMoney(changeReturned)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Checkout & Print Action */}
            <button
              onClick={checkoutAndPrint}
              disabled={cart.length === 0 || busy}
              className="mt-4 w-full rounded-2xl bg-saffron py-3.5 font-display text-base font-bold uppercase tracking-wider text-espresso shadow-[0_5px_20px_rgba(231,167,58,0.3)] transition-transform active:scale-98 disabled:opacity-50"
            >
              {busy ? "Processing POS..." : "⚡ Complete Order & Print Thermal Bill"}
            </button>
          </div>

        </div>
      </div>

      {/* Render Thermal Bill Modal once POS order completes */}
      {billModalData && (
        <ThermalBillModal
          billData={billModalData}
          onClose={() => {
            setBillModalData(null);
            onClose();
          }}
        />
      )}
    </div>
  );
}
