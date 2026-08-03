"use client";

import { useEffect, useState } from "react";

type TransferRequestWithNamesDTO = {
  id: string;
  from_restaurant_id: string;
  to_restaurant_id: string;
  from_restaurant_name: string;
  to_restaurant_name: string;
  ingredient_name: string;
  unit: string;
  quantity: string | number;
  status: string;
  note: string | null;
  created_at: string;
  resolved_at: string | null;
};

export function OrgInventoryTransfersPanel() {
  const [requests, setRequests] = useState<TransferRequestWithNamesDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/org/inventory/transfer-requests")
      .then((r) => r.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, []);

  async function decide(id: string, status: "approved" | "rejected") {
    if (decidingId) return;
    setDecidingId(id);
    try {
      const res = await fetch(`/api/admin/org/inventory/transfer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) load();
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <main aria-label="Inventory Transfers">
      <h1 className="font-display text-3xl italic text-linen">Inventory Transfers</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Pending stock-transfer requests across every branch in your
        organization. Approving deducts from the source branch and credits
        the destination immediately; rejecting just closes the request.
      </p>

      <div className="mt-8 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && requests.length === 0 && (
          <p className="text-sm text-linen/40">No pending transfer requests.</p>
        )}
        {requests.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-linen/10 bg-[#221913] p-6"
          >
            <div>
              <p className="font-display text-lg italic text-linen">
                {r.quantity} {r.unit} {r.ingredient_name}
              </p>
              <p className="text-xs text-linen/50">
                {r.from_restaurant_name} <span aria-hidden>&rarr;</span> {r.to_restaurant_name}
                {" · "}
                {new Date(r.created_at).toLocaleDateString()}
                {r.note && <span className="ml-2 italic text-linen/40">&ldquo;{r.note}&rdquo;</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => decide(r.id, "approved")}
                disabled={decidingId === r.id}
                className="rounded-full bg-saffron px-4 py-2 text-xs font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => decide(r.id, "rejected")}
                disabled={decidingId === r.id}
                className="rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
