"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CATEGORIES } from "@/data/menu";
import type { MenuItem, MenuCategory } from "@/data/menu";

type StoredMenuItem = MenuItem & { available: boolean };

export function MenuEditor() {
  const [items, setItems] = useState<StoredMenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [category, setCategory] = useState<MenuCategory>("starters");

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function editLocal(id: string, patch: Partial<StoredMenuItem>) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function save(item: StoredMenuItem, patch?: Partial<StoredMenuItem>) {
    const body = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      available: item.available,
      ...patch,
    };
    setSavingId(item.id);
    setSavedId(null);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        editLocal(item.id, data.item);
        setSavedId(item.id);
        setTimeout(() => setSavedId((cur) => (cur === item.id ? null : cur)), 2000);
      }
    } finally {
      setSavingId(null);
    }
  }

  const visible = items.filter((m) => m.category === category);

  return (
    <main aria-label="Menu editor">
      <h1 className="font-display text-3xl italic text-linen">Menu editor</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Edit names, prices, and descriptions, or mark an item sold out. Every
        change goes live on the website and every guest&apos;s QR menu{" "}
        <span className="text-saffron">instantly</span> — no rebuild, no
        developer.
      </p>

      <div role="tablist" aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={cat.id === category}
            onClick={() => setCategory(cat.id)}
            className={`rounded-full px-4 py-2 font-body text-sm font-medium transition-colors ${
              cat.id === category
                ? "bg-saffron text-espresso"
                : "bg-linen/5 text-linen/70 hover:bg-linen/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {!loaded &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-linen/5" aria-hidden />
          ))}
        {visible.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 transition-colors ${
              item.available
                ? "border-linen/10 bg-[#221913]"
                : "border-red-500/30 bg-[#1c1410]"
            }`}
          >
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={item.photo.src}
                  alt={item.photo.alt}
                  fill
                  sizes="64px"
                  className={`object-cover ${item.available ? "" : "opacity-40 grayscale"}`}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex flex-wrap gap-2.5">
                  <div className="min-w-40 flex-1">
                    <label htmlFor={`name-${item.id}`} className="block text-[10px] uppercase tracking-[0.15em] text-linen/40">
                      Name
                    </label>
                    <input
                      id={`name-${item.id}`}
                      value={item.name}
                      onChange={(e) => editLocal(item.id, { name: e.target.value })}
                      onBlur={() => save(item)}
                      className="mt-0.5 w-full rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen focus:border-saffron focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <label htmlFor={`price-${item.id}`} className="block text-[10px] uppercase tracking-[0.15em] text-linen/40">
                      Price
                    </label>
                    <input
                      id={`price-${item.id}`}
                      value={item.price}
                      onChange={(e) => editLocal(item.id, { price: e.target.value })}
                      onBlur={() => save(item)}
                      className="mt-0.5 w-full rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-saffron focus:border-saffron focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`desc-${item.id}`} className="block text-[10px] uppercase tracking-[0.15em] text-linen/40">
                    Description
                  </label>
                  <input
                    id={`desc-${item.id}`}
                    value={item.description}
                    onChange={(e) => editLocal(item.id, { description: e.target.value })}
                    onBlur={() => save(item)}
                    className="mt-0.5 w-full rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen/80 focus:border-saffron focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => save(item, { available: !item.available })}
                  aria-pressed={!item.available}
                  className={`rounded-full px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                    item.available
                      ? "bg-sage/15 text-sage hover:bg-red-500/15 hover:text-red-400"
                      : "bg-red-500/15 text-red-400 hover:bg-sage/15 hover:text-sage"
                  }`}
                >
                  {item.available ? "Available" : "Sold out (86)"}
                </button>
                <span
                  aria-live="polite"
                  className="h-4 text-[11px] text-linen/40"
                >
                  {savingId === item.id
                    ? "Saving…"
                    : savedId === item.id
                      ? "✓ Live on site"
                      : ""}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
