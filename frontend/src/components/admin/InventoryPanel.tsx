"use client";

import { useEffect, useState } from "react";
import type { IngredientDTO, SupplierDTO } from "@/lib/types";

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

export function InventoryPanel() {
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState("0");
  const [threshold, setThreshold] = useState("0");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");

  function load() {
    Promise.all([
      fetch("/api/admin/ingredients").then((r) => r.json()),
      fetch("/api/admin/suppliers").then((r) => r.json()),
    ])
      .then(([ing, sup]) => {
        setIngredients(ing);
        setSuppliers(sup);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, []);

  async function addSupplier() {
    if (!supplierName.trim()) return;
    const res = await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: supplierName }),
    });
    if (res.ok) {
      setSupplierName("");
      load();
    }
  }

  async function addIngredient() {
    if (!name.trim()) return;
    const res = await fetch("/api/admin/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        unit,
        stock_quantity: stock,
        low_stock_threshold: threshold,
        supplier_id: supplierId || null,
      }),
    });
    if (res.ok) {
      setName("");
      setStock("0");
      setThreshold("0");
      load();
    }
  }

  async function updateStock(ingredient: IngredientDTO, value: string) {
    const res = await fetch(`/api/admin/ingredients/${ingredient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_quantity: value }),
    });
    if (res.ok) load();
  }

  async function removeIngredient(id: string) {
    const res = await fetch(`/api/admin/ingredients/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <main aria-label="Inventory">
      <h1 className="font-display text-3xl italic text-linen">Inventory</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Track ingredient stock. Attach ingredients to a menu item&apos;s
        recipe (in Menu Editor) and stock deducts automatically as orders
        come in.
      </p>

      <div className="mt-8 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <h2 className="font-display text-xl italic text-linen">Suppliers</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {suppliers.map((s) => (
            <span key={s.id} className="rounded-full bg-linen/10 px-3 py-1 text-xs text-linen/70">
              {s.name}
            </span>
          ))}
          <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="New supplier" className={inputClasses} />
          <button onClick={addSupplier} className="rounded-full bg-saffron px-4 py-2 text-xs font-semibold text-espresso">
            + Add
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-3xl border border-linen/10 bg-[#221913] p-6 sm:grid-cols-2 lg:grid-cols-5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingredient name" className={inputClasses} />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (kg, L, pcs)" className={inputClasses} />
        <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock qty" className={inputClasses} />
        <input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="Low-stock threshold" className={inputClasses} />
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClasses}>
          <option value="">No supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button onClick={addIngredient} className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso sm:col-span-2 lg:col-span-1">
          + Add ingredient
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && ingredients.length === 0 && <p className="text-sm text-linen/40">No ingredients yet.</p>}
        {ingredients.map((i) => (
          <div
            key={i.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
              i.is_low_stock ? "border-red-500/40 bg-[#1c1410]" : "border-linen/10 bg-[#221913]"
            }`}
          >
            <div>
              <p className="font-display text-lg italic text-linen">{i.name}</p>
              <p className="text-xs text-linen/50">
                threshold {i.low_stock_threshold} {i.unit}
                {i.is_low_stock && <span className="ml-2 text-red-400">· low stock</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                defaultValue={i.stock_quantity}
                onBlur={(e) => updateStock(i, e.target.value)}
                className={`${inputClasses} w-24 text-right`}
              />
              <span className="text-xs text-linen/40">{i.unit}</span>
              <button onClick={() => removeIngredient(i.id)} className="text-linen/40 hover:text-red-400" aria-label={`Remove ${i.name}`}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
