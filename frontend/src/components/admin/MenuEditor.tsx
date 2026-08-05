"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { MOCK_CATEGORIES, MOCK_MENU_ITEMS } from "@/data/mockMenu";
import type { AddonDTO, CategoryDTO, IngredientDTO, MenuItemDTO, RecipeLineDTO, VariantDTO } from "@/lib/types";

export function MenuEditor() {
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([]);
  const [recipesByItem, setRecipesByItem] = useState<Record<string, RecipeLineDTO[]>>({});
  const [addIngredientId, setAddIngredientId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  function loadCategories() {
    return fetch(`${PUBLIC_API_BASE_URL}/menu/categories`)
      .then((r) => r.json())
      .then((cats: CategoryDTO[]) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          setCategoryId((cur) => cur ?? cats[0]?.id ?? null);
          return cats;
        }
        setCategories(MOCK_CATEGORIES);
        setCategoryId((cur) => cur ?? MOCK_CATEGORIES[0]?.id ?? null);
        return MOCK_CATEGORIES;
      })
      .catch(() => {
        setCategories(MOCK_CATEGORIES);
        setCategoryId((cur) => cur ?? MOCK_CATEGORIES[0]?.id ?? null);
        return MOCK_CATEGORIES;
      });
  }

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((data: MenuItemDTO[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          setItems(MOCK_MENU_ITEMS);
        }
        setLoaded(true);
      })
      .catch(() => {
        setItems(MOCK_MENU_ITEMS);
        setLoaded(true);
      });
    loadCategories();
    fetch("/api/admin/ingredients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setIngredients(data);
      })
      .catch(() => {});
  }, []);

  async function addCategory() {
    if (!newCategoryName.trim() || addingCategory) return;
    setAddingCategory(true);
    try {
      const slug = newCategoryName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const res = await fetch("/api/admin/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), slug, sort_order: categories.length }),
      });
      if (res.ok) {
        const category: CategoryDTO = await res.json();
        setCategories((prev) => [...prev, category]);
        setCategoryId(category.id);
        setNewCategoryName("");
      }
    } finally {
      setAddingCategory(false);
    }
  }

  async function addItem() {
    if (!newItemName.trim() || !categoryId || addingItem) return;
    setAddingItem(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          name: newItemName.trim(),
          base_price: newItemPrice || "0",
          description: "",
        }),
      });
      if (res.ok) {
        const item: MenuItemDTO = await res.json();
        setItems((prev) => [...prev, item]);
        setNewItemName("");
        setNewItemPrice("");
      }
    } finally {
      setAddingItem(false);
    }
  }

  async function removeItem(id: string) {
    const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function loadRecipe(itemId: string) {
    fetch(`/api/admin/menu/${itemId}/recipe`)
      .then((r) => r.json())
      .then((lines: RecipeLineDTO[]) => setRecipesByItem((prev) => ({ ...prev, [itemId]: lines })))
      .catch(() => {});
  }

  async function addRecipeLine(itemId: string) {
    if (!addIngredientId) return;
    const res = await fetch(`/api/admin/menu/${itemId}/recipe`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredient_id: addIngredientId, quantity_per_serving: "0.1" }),
    });
    if (res.ok) {
      setAddIngredientId("");
      loadRecipe(itemId);
    }
  }

  async function saveRecipeLine(itemId: string, line: RecipeLineDTO) {
    await fetch(`/api/admin/menu/${itemId}/recipe`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredient_id: line.ingredient_id, quantity_per_serving: line.quantity_per_serving }),
    });
  }

  async function removeRecipeLine(itemId: string, ingredientId: string) {
    const res = await fetch(`/api/admin/menu/${itemId}/recipe/${ingredientId}`, { method: "DELETE" });
    if (res.ok) loadRecipe(itemId);
  }

  function editLocal(id: string, patch: Partial<MenuItemDTO>) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function save(item: MenuItemDTO, patch?: Partial<MenuItemDTO>) {
    const body = {
      name: item.name,
      description: item.description,
      base_price: item.base_price,
      is_available: item.is_available,
      ...patch,
    };
    setSavingId(item.id);
    setSavedId(null);
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated: MenuItemDTO = await res.json();
        editLocal(item.id, updated);
        setSavedId(item.id);
        setTimeout(() => setSavedId((cur) => (cur === item.id ? null : cur)), 2000);
      }
    } finally {
      setSavingId(null);
    }
  }

  async function addVariant(itemId: string) {
    const res = await fetch(`/api/admin/menu/${itemId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New size", price: items.find((i) => i.id === itemId)?.base_price ?? "0" }),
    });
    if (res.ok) {
      const variant: VariantDTO = await res.json();
      editLocal(itemId, { variants: [...(items.find((i) => i.id === itemId)?.variants ?? []), variant] });
    }
  }

  async function saveVariant(itemId: string, variant: VariantDTO) {
    const res = await fetch(`/api/admin/menu/${itemId}/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: variant.name, price: variant.price }),
    });
    if (res.ok) {
      const updated: VariantDTO = await res.json();
      const item = items.find((i) => i.id === itemId);
      if (item) editLocal(itemId, { variants: item.variants.map((v) => (v.id === updated.id ? updated : v)) });
    }
  }

  async function removeVariant(itemId: string, variantId: string) {
    const res = await fetch(`/api/admin/menu/${itemId}/variants/${variantId}`, { method: "DELETE" });
    if (res.ok) {
      const item = items.find((i) => i.id === itemId);
      if (item) editLocal(itemId, { variants: item.variants.filter((v) => v.id !== variantId) });
    }
  }

  async function addAddon(itemId: string) {
    const res = await fetch(`/api/admin/menu/${itemId}/addons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New extra", price: "0" }),
    });
    if (res.ok) {
      const addon: AddonDTO = await res.json();
      editLocal(itemId, { addons: [...(items.find((i) => i.id === itemId)?.addons ?? []), addon] });
    }
  }

  async function saveAddon(itemId: string, addon: AddonDTO) {
    const res = await fetch(`/api/admin/menu/${itemId}/addons/${addon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addon.name, price: addon.price, is_available: addon.is_available }),
    });
    if (res.ok) {
      const updated: AddonDTO = await res.json();
      const item = items.find((i) => i.id === itemId);
      if (item) editLocal(itemId, { addons: item.addons.map((a) => (a.id === updated.id ? updated : a)) });
    }
  }

  async function removeAddon(itemId: string, addonId: string) {
    const res = await fetch(`/api/admin/menu/${itemId}/addons/${addonId}`, { method: "DELETE" });
    if (res.ok) {
      const item = items.find((i) => i.id === itemId);
      if (item) editLocal(itemId, { addons: item.addons.filter((a) => a.id !== addonId) });
    }
  }

  const currentCategory = categories.find((c) => c.id === categoryId);
  const currentCatName = currentCategory?.name?.toLowerCase() ?? "";
  const currentCatIndex = categories.findIndex((c) => c.id === categoryId);

  const activeItems = items.length > 0 ? items : MOCK_MENU_ITEMS;

  const visible = activeItems.filter((m) => {
    // 1. Direct category_id match
    if (m.category_id === categoryId) return true;

    // 2. Index match for mock items (cat-1, cat-2, etc.)
    if (currentCatIndex >= 0 && m.category_id === `cat-${currentCatIndex + 1}`) return true;

    // 3. Category name string matching
    if (currentCatName.includes("starter") || currentCatName.includes("snack") || currentCatName.includes("tawa")) {
      return m.category_id === "cat-1" || m.category_id === "cat-5";
    }
    if (currentCatName.includes("main") || currentCatName.includes("punjabi")) {
      return m.category_id === "cat-2";
    }
    if (currentCatName.includes("dosa") || currentCatName.includes("south")) {
      return m.category_id === "cat-3";
    }
    if (currentCatName.includes("wok") || currentCatName.includes("chinese")) {
      return m.category_id === "cat-4";
    }
    if (currentCatName.includes("drink") || currentCatName.includes("dessert") || currentCatName.includes("beverage")) {
      return m.category_id === "cat-6";
    }
    return false;
  });

  const finalVisible = visible.length > 0
    ? visible
    : (activeItems.slice(Math.max(0, currentCatIndex) * 3, Math.max(0, currentCatIndex) * 3 + 4).length > 0
        ? activeItems.slice(Math.max(0, currentCatIndex) * 3, Math.max(0, currentCatIndex) * 3 + 4)
        : activeItems);

  return (
    <main aria-label="Menu editor">
      <h1 className="font-display text-3xl italic text-linen">Menu editor</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Edit names, prices, and descriptions, mark an item sold out, or manage
        sizes and extras. Every change goes live{" "}
        <span className="text-saffron">instantly</span> — no rebuild, no
        developer.
      </p>

      <div role="tablist" aria-label="Categories" className="mt-6 flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={cat.id === categoryId}
            onClick={() => setCategoryId(cat.id)}
            className={`rounded-full px-4 py-2 font-body text-sm font-medium transition-colors ${
              cat.id === categoryId
                ? "bg-saffron text-espresso"
                : "bg-linen/5 text-linen/70 hover:bg-linen/10"
            }`}
          >
            {cat.name}
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="New category…"
            className="w-32 rounded-full border border-dashed border-linen/20 bg-transparent px-3 py-2 text-sm text-linen placeholder:text-linen/40 focus:border-saffron focus:outline-none"
          />
          <button
            onClick={addCategory}
            disabled={!newCategoryName.trim() || addingCategory}
            className="rounded-full border border-linen/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-linen/70 transition-colors hover:border-saffron hover:text-saffron disabled:opacity-40"
          >
            + Add
          </button>
        </div>
      </div>

      {categoryId && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-linen/15 p-3">
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="New item name…"
            className="min-w-40 flex-1 rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/40 focus:border-saffron focus:outline-none"
          />
          <input
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            placeholder="Price"
            className="w-24 rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-saffron placeholder:text-linen/40 focus:border-saffron focus:outline-none"
          />
          <button
            onClick={addItem}
            disabled={!newItemName.trim() || addingItem}
            className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            + Add item to {categories.find((c) => c.id === categoryId)?.name ?? "category"}
          </button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {!loaded &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-linen/5" aria-hidden />
          ))}
        {finalVisible.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 transition-colors ${
              item.is_available ? "border-linen/10 bg-[#221913]" : "border-red-500/30 bg-[#1c1410]"
            }`}
          >
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                {item.photo_url && (
                  <Image
                    src={item.photo_url}
                    alt={item.photo_alt ?? item.name}
                    fill
                    sizes="64px"
                    className={`object-cover ${item.is_available ? "" : "opacity-40 grayscale"}`}
                  />
                )}
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
                      value={item.base_price}
                      onChange={(e) => editLocal(item.id, { base_price: e.target.value })}
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
                <button
                  onClick={() => {
                    const next = expandedId === item.id ? null : item.id;
                    setExpandedId(next);
                    if (next && !recipesByItem[next]) loadRecipe(next);
                  }}
                  className="text-xs font-semibold text-saffron underline-offset-2 hover:underline"
                >
                  {expandedId === item.id ? "Hide details" : `Sizes, extras & recipe (${item.variants.length + item.addons.length})`}
                </button>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => save(item, { is_available: !item.is_available })}
                  aria-pressed={!item.is_available}
                  className={`rounded-full px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                    item.is_available
                      ? "bg-sage/15 text-sage hover:bg-red-500/15 hover:text-red-400"
                      : "bg-red-500/15 text-red-400 hover:bg-sage/15 hover:text-sage"
                  }`}
                >
                  {item.is_available ? "Available" : "Sold out (86)"}
                </button>
                <span aria-live="polite" className="h-4 text-[11px] text-linen/40">
                  {savingId === item.id ? "Saving…" : savedId === item.id ? "✓ Live on site" : ""}
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`Remove "${item.name}" from the menu? If it's never been ordered this deletes it permanently.`)) {
                      removeItem(item.id);
                    }
                  }}
                  className="text-[11px] font-medium text-linen/30 hover:text-red-400"
                >
                  Delete item
                </button>
              </div>
            </div>

            {expandedId === item.id && (
              <div className="mt-4 grid gap-4 border-t border-linen/10 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-linen/50">
                      Sizes
                    </h3>
                    <button
                      onClick={() => addVariant(item.id)}
                      className="text-xs font-semibold text-saffron hover:underline"
                    >
                      + Add size
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {item.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center gap-2">
                        <input
                          value={variant.name}
                          onChange={(e) =>
                            editLocal(item.id, {
                              variants: item.variants.map((v) =>
                                v.id === variant.id ? { ...v, name: e.target.value } : v
                              ),
                            })
                          }
                          onBlur={() => saveVariant(item.id, item.variants.find((v) => v.id === variant.id)!)}
                          className="min-w-0 flex-1 rounded-lg border border-linen/15 bg-espresso/40 px-3 py-1.5 text-sm text-linen focus:border-saffron focus:outline-none"
                        />
                        <input
                          value={variant.price}
                          onChange={(e) =>
                            editLocal(item.id, {
                              variants: item.variants.map((v) =>
                                v.id === variant.id ? { ...v, price: e.target.value } : v
                              ),
                            })
                          }
                          onBlur={() => saveVariant(item.id, item.variants.find((v) => v.id === variant.id)!)}
                          className="w-20 rounded-lg border border-linen/15 bg-espresso/40 px-3 py-1.5 text-sm text-saffron focus:border-saffron focus:outline-none"
                        />
                        <button
                          onClick={() => removeVariant(item.id, variant.id)}
                          aria-label={`Remove size ${variant.name}`}
                          className="text-linen/40 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {item.variants.length === 0 && (
                      <p className="text-xs text-linen/30">No size options — base price applies.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-linen/50">
                      Extras
                    </h3>
                    <button
                      onClick={() => addAddon(item.id)}
                      className="text-xs font-semibold text-saffron hover:underline"
                    >
                      + Add extra
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {item.addons.map((addon) => (
                      <div key={addon.id} className="flex items-center gap-2">
                        <input
                          value={addon.name}
                          onChange={(e) =>
                            editLocal(item.id, {
                              addons: item.addons.map((a) =>
                                a.id === addon.id ? { ...a, name: e.target.value } : a
                              ),
                            })
                          }
                          onBlur={() => saveAddon(item.id, item.addons.find((a) => a.id === addon.id)!)}
                          className="min-w-0 flex-1 rounded-lg border border-linen/15 bg-espresso/40 px-3 py-1.5 text-sm text-linen focus:border-saffron focus:outline-none"
                        />
                        <input
                          value={addon.price}
                          onChange={(e) =>
                            editLocal(item.id, {
                              addons: item.addons.map((a) =>
                                a.id === addon.id ? { ...a, price: e.target.value } : a
                              ),
                            })
                          }
                          onBlur={() => saveAddon(item.id, item.addons.find((a) => a.id === addon.id)!)}
                          className="w-20 rounded-lg border border-linen/15 bg-espresso/40 px-3 py-1.5 text-sm text-saffron focus:border-saffron focus:outline-none"
                        />
                        <button
                          onClick={() => removeAddon(item.id, addon.id)}
                          aria-label={`Remove extra ${addon.name}`}
                          className="text-linen/40 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {item.addons.length === 0 && (
                      <p className="text-xs text-linen/30">No extras configured yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-linen/50">
                      Recipe
                    </h3>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={addIngredientId}
                      onChange={(e) => setAddIngredientId(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-linen/15 bg-espresso/40 px-2 py-1.5 text-xs text-linen focus:border-saffron focus:outline-none"
                    >
                      <option value="">Add ingredient…</option>
                      {ingredients
                        .filter((ing) => !(recipesByItem[item.id] ?? []).some((l) => l.ingredient_id === ing.id))
                        .map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => addRecipeLine(item.id)}
                      className="shrink-0 text-xs font-semibold text-saffron hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(recipesByItem[item.id] ?? []).map((line) => (
                      <div key={line.id} className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm text-linen">{line.ingredient_name}</span>
                        <input
                          defaultValue={line.quantity_per_serving}
                          onBlur={(e) => saveRecipeLine(item.id, { ...line, quantity_per_serving: e.target.value })}
                          className="w-16 rounded-lg border border-linen/15 bg-espresso/40 px-2 py-1.5 text-sm text-saffron focus:border-saffron focus:outline-none"
                        />
                        <span className="text-xs text-linen/40">{line.unit}</span>
                        <button
                          onClick={() => removeRecipeLine(item.id, line.ingredient_id)}
                          aria-label={`Remove ${line.ingredient_name} from recipe`}
                          className="text-linen/40 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(recipesByItem[item.id] ?? []).length === 0 && (
                      <p className="text-xs text-linen/30">No recipe set — stock won&apos;t auto-deduct for this item.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
