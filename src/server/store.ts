import { promises as fs } from "fs";
import path from "path";
import { MENU_ITEMS, type MenuItem } from "@/data/menu";
import { SITE } from "@/data/site";
import { emitEvent } from "./events";

/* ── Types ─────────────────────────────────────────────────────────── */

export type StoredMenuItem = MenuItem & {
  /** false = 86'd — instantly hidden from every guest surface. */
  available: boolean;
};

export type OrderStatus = "received" | "preparing" | "ready" | "served";

export type OrderLine = {
  itemId: string;
  name: string;
  price: string;
  quantity: number;
};

export type Order = {
  id: string;
  table: string;
  lines: OrderLine[];
  note: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  announcement: { text: string; href: string; label: string } | null;
  /** Demo-branding line shown in the navbar. */
  presents: string;
};

type DB = {
  menu: StoredMenuItem[];
  site: SiteSettings;
  orders: Order[];
  tables: string[];
};

/* ── Persistence ───────────────────────────────────────────────────── */

const DB_PATH = path.join(process.cwd(), ".demo-db.json");

const g = globalThis as unknown as { __smapleeDb?: DB };

function seed(): DB {
  return {
    menu: MENU_ITEMS.map((item) => ({ ...item, available: true })),
    site: {
      announcement: SITE.announcement,
      presents: "KelvionTech presents",
    },
    orders: [],
    tables: Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
  };
}

export async function getDb(): Promise<DB> {
  if (g.__smapleeDb) return g.__smapleeDb;
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    g.__smapleeDb = JSON.parse(raw) as DB;
  } catch {
    g.__smapleeDb = seed();
    await persist();
  }
  return g.__smapleeDb!;
}

async function persist(): Promise<void> {
  if (!g.__smapleeDb) return;
  await fs.writeFile(DB_PATH, JSON.stringify(g.__smapleeDb, null, 2), "utf-8");
}

/* ── Menu ──────────────────────────────────────────────────────────── */

export async function getMenu(): Promise<StoredMenuItem[]> {
  return (await getDb()).menu;
}

export async function getAvailableMenu(): Promise<StoredMenuItem[]> {
  return (await getDb()).menu.filter((m) => m.available);
}

export async function updateMenuItem(
  id: string,
  patch: Partial<Pick<StoredMenuItem, "name" | "description" | "price" | "available">>
): Promise<StoredMenuItem | null> {
  const db = await getDb();
  const item = db.menu.find((m) => m.id === id);
  if (!item) return null;
  Object.assign(item, patch);
  await persist();
  emitEvent({ type: "menu.updated", itemId: id });
  return item;
}

/* ── Site settings ─────────────────────────────────────────────────── */

export async function getSiteSettings(): Promise<SiteSettings> {
  return (await getDb()).site;
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>
): Promise<SiteSettings> {
  const db = await getDb();
  db.site = { ...db.site, ...patch };
  await persist();
  emitEvent({ type: "site.updated" });
  return db.site;
}

/* ── Orders ────────────────────────────────────────────────────────── */

const STATUS_FLOW: OrderStatus[] = ["received", "preparing", "ready", "served"];

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(status);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
}

export async function createOrder(input: {
  table: string;
  lines: OrderLine[];
  note: string;
}): Promise<Order> {
  const db = await getDb();
  const now = new Date().toISOString();
  const order: Order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`,
    table: input.table,
    lines: input.lines,
    note: input.note,
    status: "received",
    createdAt: now,
    updatedAt: now,
  };
  db.orders.unshift(order);
  await persist();
  emitEvent({ type: "order.created", order });
  return order;
}

export async function listOrders(table?: string): Promise<Order[]> {
  const db = await getDb();
  return table ? db.orders.filter((o) => o.table === table) : db.orders;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const db = await getDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  await persist();
  emitEvent({ type: "order.updated", order });
  return order;
}

export async function getTables(): Promise<string[]> {
  return (await getDb()).tables;
}

/** A venue's featured dishes, live from the store (86'd items drop out). */
export async function getVenueItems(featuredIds: string[]): Promise<StoredMenuItem[]> {
  const menu = await getAvailableMenu();
  return featuredIds
    .map((id) => menu.find((m) => m.id === id))
    .filter((m): m is StoredMenuItem => !!m);
}
