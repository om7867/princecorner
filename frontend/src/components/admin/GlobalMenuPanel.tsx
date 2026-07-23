"use client";

import { useEffect, useState } from "react";

type GlobalMenuItemDTO = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  base_price: string;
  category_name: string;
  dietary_tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

export function GlobalMenuPanel() {
  const [items, setItems] = useState<GlobalMenuItemDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [dietaryTags, setDietaryTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  function load() {
    fetch("/api/admin/org/menu")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, []);

  async function createItem() {
    if (!name.trim() || !categoryName.trim() || !basePrice.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/org/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          base_price: basePrice,
          category_name: categoryName,
          dietary_tags: dietaryTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setName("");
        setDescription("");
        setBasePrice("");
        setCategoryName("");
        setDietaryTags("");
        setNote(`Pushed "${name}" to every active branch.`);
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function patchItem(item: GlobalMenuItemDTO, field: string, value: string) {
    const current = item[field as keyof GlobalMenuItemDTO];
    if (value === current) return;
    const res = await fetch(`/api/admin/org/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setNote("Re-pushed the update to every active branch.");
      load();
    }
  }

  async function toggleActive(item: GlobalMenuItemDTO) {
    const res = await fetch(`/api/admin/org/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    if (res.ok) load();
  }

  return (
    <main aria-label="Global Menu">
      <h1 className="font-display text-3xl italic text-linen">Global Menu</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        A chain-wide master menu. Every item you add or edit here is pushed
        to the matching menu item in every active branch — branch admins can
        still override price and availability locally.
      </p>
      {note && <p className="mt-2 text-xs text-sage">{note}</p>}

      <div className="mt-8 grid gap-3 rounded-3xl border border-linen/10 bg-[#221913] p-6 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className={inputClasses}
        />
        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category"
          className={inputClasses}
        />
        <input
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          placeholder="Base price"
          className={inputClasses}
        />
        <input
          value={dietaryTags}
          onChange={(e) => setDietaryTags(e.target.value)}
          placeholder="Tags, comma separated"
          className={inputClasses}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className={inputClasses}
        />
        <button
          onClick={createItem}
          disabled={saving}
          className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50 lg:col-span-5"
        >
          + Add to global menu
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && items.length === 0 && <p className="text-sm text-linen/40">No global menu items yet.</p>}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linen/10 bg-[#221913] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                defaultValue={item.name}
                onBlur={(e) => patchItem(item, "name", e.target.value)}
                className={`${inputClasses} w-48`}
                aria-label={`Name for ${item.name}`}
              />
              <input
                defaultValue={item.category_name}
                onBlur={(e) => patchItem(item, "category_name", e.target.value)}
                className={`${inputClasses} w-40`}
                aria-label={`Category for ${item.name}`}
              />
              <input
                defaultValue={item.base_price}
                onBlur={(e) => patchItem(item, "base_price", e.target.value)}
                className={`${inputClasses} w-24`}
                aria-label={`Base price for ${item.name}`}
              />
            </div>
            <button
              onClick={() => toggleActive(item)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                item.is_active ? "bg-sage/15 text-sage" : "bg-linen/10 text-linen/50"
              }`}
            >
              {item.is_active ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
