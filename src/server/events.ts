import { EventEmitter } from "events";
import type { Order } from "./store";

export type LiveEvent =
  | { type: "order.created"; order: Order }
  | { type: "order.updated"; order: Order }
  | { type: "menu.updated"; itemId: string }
  | { type: "site.updated" };

/**
 * In-process pub/sub for the demo's real-time layer. Cached on globalThis
 * so Next.js dev-mode module reloads don't split the bus. Swap for Redis
 * pub/sub or a message bus when deploying multi-instance.
 */
const g = globalThis as unknown as { __smapleeBus?: EventEmitter };

function bus(): EventEmitter {
  if (!g.__smapleeBus) {
    g.__smapleeBus = new EventEmitter();
    g.__smapleeBus.setMaxListeners(100);
  }
  return g.__smapleeBus;
}

export function emitEvent(event: LiveEvent): void {
  bus().emit("live", event);
}

export function subscribe(listener: (event: LiveEvent) => void): () => void {
  bus().on("live", listener);
  return () => bus().off("live", listener);
}
