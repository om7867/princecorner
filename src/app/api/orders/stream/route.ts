import { subscribe, type LiveEvent } from "@/server/events";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream — the demo's real-time layer.
 *   /api/orders/stream            → staff/KDS: every order + menu/site event
 *   /api/orders/stream?table=T5   → guest: only their own table's orders
 *
 * SSE (one-directional, auto-reconnecting) is deliberately chosen for the
 * guest tracker — it survives flaky restaurant Wi-Fi better than a
 * bidirectional socket, and the guest never needs to send anything back.
 */
export async function GET(request: Request) {
  const table = new URL(request.url).searchParams.get("table");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: LiveEvent) => {
        // guests only receive events about their own table
        if (
          table &&
          (event.type === "order.created" || event.type === "order.updated") &&
          event.order.table !== table
        ) {
          return;
        }
        if (table && (event.type === "menu.updated" || event.type === "site.updated")) {
          // menu changes still matter to guests (86'd items), site changes don't
          if (event.type === "site.updated") return;
        }
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          /* stream already closed */
        }
      };

      const unsubscribe = subscribe(send);
      // heartbeat keeps proxies from closing the idle connection
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* closed */
        }
      }, 25000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
