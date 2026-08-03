"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_WS_BASE_URL } from "@/lib/env";
import type { ReservationDTO, ReservationStatus } from "@/lib/types";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: "bg-saffron/15 text-saffron",
  confirmed: "bg-sage/15 text-sage",
  cancelled: "bg-red-500/15 text-red-400",
};

export function ReservationsList() {
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const closedByUsRef = useRef(false);

  useEffect(() => {
    fetch("/api/admin/reservations")
      .then((r) => r.json())
      .then((data: ReservationDTO[]) => {
        setReservations(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // live: new website bookings appear without a refresh, same staff-WS
  // ticket flow the Live Orders board uses
  useEffect(() => {
    closedByUsRef.current = false;

    async function connect() {
      const res = await fetch("/api/ws-ticket").catch(() => null);
      if (!res || !res.ok) {
        scheduleReconnect();
        return;
      }
      const { ticket } = await res.json();
      const ws = new WebSocket(`${PUBLIC_WS_BASE_URL}/ws/orders?ticket=${ticket}`);
      wsRef.current = ws;

      ws.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          if (event.type === "reservation.created") {
            const reservation: ReservationDTO = event.reservation;
            setReservations((prev) =>
              prev.some((r) => r.id === reservation.id) ? prev : [reservation, ...prev]
            );
          }
        } catch {
          /* ignore */
        }
      };
      ws.onopen = () => {
        retryRef.current = 0;
      };
      ws.onclose = () => {
        if (!closedByUsRef.current) scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      const delay = Math.min(1000 * 2 ** retryRef.current, 15000);
      retryRef.current += 1;
      setTimeout(connect, delay);
    }

    connect();
    return () => {
      closedByUsRef.current = true;
      wsRef.current?.close();
    };
  }, []);

  async function setStatus(id: string, status: ReservationStatus) {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  return (
    <main aria-label="Reservations">
      <h1 className="font-display text-3xl italic text-linen">Reservations</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Bookings made from the website appear here — confirm or cancel, and
        the guest&apos;s reference code will match what they were given.
      </p>

      {loaded && reservations.length === 0 && (
        <div className="mt-16 rounded-3xl border border-dashed border-linen/15 p-12 text-center">
          <p className="font-display text-xl italic text-linen/70">No reservations yet</p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {reservations.map((r) => (
          <article
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-linen/10 bg-[#221913] p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-lg italic text-linen">{r.name}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-linen/60">
                {r.date} at {r.time} · party of {r.party_size} · {r.phone}
              </p>
              {r.note && <p className="mt-1 text-xs italic text-linen/40">“{r.note}”</p>}
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-linen/30">{r.reference_code}</p>
            </div>
            {r.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus(r.id, "confirmed")}
                  className="rounded-full bg-sage/15 px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-sage hover:bg-sage/25"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setStatus(r.id, "cancelled")}
                  className="rounded-full bg-red-500/15 px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-red-400 hover:bg-red-500/25"
                >
                  Cancel
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
