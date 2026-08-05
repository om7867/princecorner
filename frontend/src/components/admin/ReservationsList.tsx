"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_WS_BASE_URL } from "@/lib/env";
import type { ReservationDTO, ReservationStatus } from "@/lib/types";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: "bg-saffron/15 text-saffron",
  confirmed: "bg-sage/15 text-sage",
  cancelled: "bg-red-500/15 text-red-400",
};

const DEFAULT_MOCK_RESERVATIONS: ReservationDTO[] = [
  { id: "res-1", reference_code: "RES-101", name: "Vikram Malhotra", phone: "9825098765", party_size: 4, date: "2026-08-06", time: "19:30", note: "Window table requested", status: "confirmed", created_at: new Date().toISOString() },
  { id: "res-2", reference_code: "RES-102", name: "Sneha Joshi", phone: "9977665544", party_size: 2, date: "2026-08-06", time: "20:00", note: "Anniversary celebration", status: "pending", created_at: new Date().toISOString() },
  { id: "res-3", reference_code: "RES-103", name: "Karan Dave", phone: "9898123456", party_size: 6, date: "2026-08-07", time: "20:30", note: "High chair needed", status: "confirmed", created_at: new Date().toISOString() },
];

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
        if (Array.isArray(data) && data.length > 0) {
          setReservations(data);
        } else {
          setReservations(DEFAULT_MOCK_RESERVATIONS);
        }
        setLoaded(true);
      })
      .catch(() => {
        setReservations(DEFAULT_MOCK_RESERVATIONS);
        setLoaded(true);
      });
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPartySize, setNewPartySize] = useState(2);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("19:30");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function setStatus(id: string, status: ReservationStatus) {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  async function deleteReservation(id: string) {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    setReservations((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" }).catch(() => {});
  }

  async function handleAddReservation(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          party_size: Number(newPartySize),
          date: newDate,
          time: newTime,
          note: newNote.trim(),
        }),
      });
      if (res.ok) {
        const created: ReservationDTO = await res.json();
        setReservations((prev) => [created, ...prev]);
        setShowAddModal(false);
        setNewName("");
        setNewPhone("");
        setNewNote("");
      }
    } finally {
      setSaving(false);
    }
  }

  const filteredReservations = reservations.filter((r) => filterStatus === "all" || r.status === filterStatus);

  return (
    <main aria-label="Reservations">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl italic text-linen">Reservations</h1>
          <p className="mt-1 max-w-xl text-sm text-linen/50">
            Manage table bookings from the website or add walk-in/phone bookings directly.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-saffron px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wider text-espresso transition-transform hover:scale-105"
        >
          ➕ New Reservation
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {["all", "pending", "confirmed", "cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filterStatus === st ? "bg-saffron text-espresso" : "bg-linen/10 text-linen/70 hover:bg-linen/15"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loaded && filteredReservations.length === 0 && (
        <div className="mt-16 rounded-3xl border border-dashed border-linen/15 p-12 text-center">
          <p className="font-display text-xl italic text-linen/70">No reservations found</p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {filteredReservations.map((r) => (
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
                📅 {r.date} at ⏰ {r.time} · 👥 party of {r.party_size} · 📞 {r.phone}
              </p>
              {r.note && <p className="mt-1 text-xs italic text-linen/40">“{r.note}”</p>}
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-linen/30">Ref: {r.reference_code}</p>
            </div>

            <div className="flex items-center gap-2">
              {r.status === "pending" && (
                <>
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
                </>
              )}
              <button
                onClick={() => deleteReservation(r.id)}
                className="rounded-full border border-linen/15 px-3 py-1.5 text-xs text-linen/50 hover:border-red-400 hover:text-red-400"
                title="Delete reservation"
              >
                🗑️
              </button>
            </div>
          </article>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-linen/20 bg-[#1c1510] p-6 text-linen shadow-2xl">
            <h2 className="font-display text-2xl italic text-linen">Add New Reservation</h2>
            
            <form onSubmit={handleAddReservation} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-linen/60">Guest Name</label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/50 px-3 py-2 text-sm text-linen focus:border-saffron focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-linen/60">Phone Number</label>
                <input
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/50 px-3 py-2 text-sm text-linen focus:border-saffron focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-linen/60">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    value={newPartySize}
                    onChange={(e) => setNewPartySize(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/50 px-3 py-2 text-sm text-linen focus:border-saffron focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-linen/60">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/50 px-2 py-2 text-xs text-linen focus:border-saffron focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-linen/60">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/50 px-2 py-2 text-xs text-linen focus:border-saffron focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-linen/60">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Window table, high chair, birthday decoration..."
                  className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/50 px-3 py-2 text-sm text-linen focus:border-saffron focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full bg-linen/10 px-4 py-2 text-xs font-semibold text-linen hover:bg-linen/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-saffron px-5 py-2 text-xs font-bold uppercase tracking-wider text-espresso shadow-md hover:scale-105"
                >
                  {saving ? "Saving..." : "Save Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
