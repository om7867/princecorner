"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import type { MenuItemDTO } from "@/lib/types";

const GLOBAL_CART_KEY = "prince_global_cart";

export type CartEntry = { item: MenuItemDTO; count: number };
export type CartMap = Record<string, CartEntry>;

/* ─── Shared in-memory store (singleton across all hook instances) ─── */
let _cart: CartMap = {};
let _toast: string | null = null;
const _listeners = new Set<() => void>();

function emitChange() {
  _listeners.forEach((fn) => fn());
}

function getSnapshot(): CartMap {
  return _cart;
}

const EMPTY_CART: CartMap = {};

function getServerSnapshot(): CartMap {
  return EMPTY_CART;
}

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

// Hydrate from localStorage once (client-only)
let _hydrated = false;
function hydrateOnce() {
  if (_hydrated || typeof window === "undefined") return;
  _hydrated = true;
  try {
    const stored = localStorage.getItem(GLOBAL_CART_KEY);
    if (stored) {
      _cart = JSON.parse(stored);
      emitChange();
    }
  } catch {
    /* ignore */
  }
}

function saveCart(newCart: CartMap) {
  _cart = newCart;
  try {
    localStorage.setItem(GLOBAL_CART_KEY, JSON.stringify(newCart));
  } catch {
    /* ignore */
  }
  emitChange();
}

/* ─── Public actions (callable from anywhere) ─── */
export function globalAddItem(item: MenuItemDTO) {
  const existing = _cart[item.id]?.count || 0;
  saveCart({
    ..._cart,
    [item.id]: { item, count: existing + 1 },
  });

  _toast = `Added 1× ${item.name} to order!`;
  emitChange();
  setTimeout(() => {
    _toast = null;
    emitChange();
  }, 2800);
}

export function globalRemoveItem(itemId: string) {
  const existing = _cart[itemId]?.count || 0;
  if (existing <= 1) {
    const { [itemId]: _, ...rest } = _cart;
    saveCart(rest);
  } else {
    saveCart({
      ..._cart,
      [itemId]: { ..._cart[itemId], count: existing - 1 },
    });
  }
}

export function globalClearCart() {
  saveCart({});
}

/* ─── React hook (subscribes to the shared store) ─── */
export function useGlobalCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hydrate cart from localStorage on first mount
  useEffect(() => {
    hydrateOnce();
  }, []);

  // Sync toast from shared state
  useEffect(() => {
    const unsub = subscribe(() => setToastMessage(_toast));
    return () => { unsub(); };
  }, []);

  const addItem = useCallback((item: MenuItemDTO) => {
    globalAddItem(item);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    globalRemoveItem(itemId);
  }, []);

  const clearCart = useCallback(() => {
    globalClearCart();
  }, []);

  const totalItems = Object.values(cart).reduce((sum, entry) => sum + entry.count, 0);
  const totalPrice = Object.values(cart).reduce(
    (sum, entry) => sum + parseFloat(entry.item.base_price || "0") * entry.count,
    0
  );

  return {
    cart,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    clearCart,
    toastMessage,
  };
}
