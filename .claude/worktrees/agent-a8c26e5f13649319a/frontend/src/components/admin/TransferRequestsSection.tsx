"use client";

import { useEffect, useMemo, useState } from "react";

type SiblingBranchDTO = {
  id: string;
  name: string;
};

type TransferRequestDTO = {
  id: string;
  from_restaurant_id: string;
  to_restaurant_id: string;
  ingredient_name: string;
  unit: string;
  quantity: string | number;
  status: string;
  note: string | null;
  created_at: string;
  resolved_at: string | null;
};

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-saffron/20 text-saffron",
  approved: "bg-sky-500/20 text-sky-300",
  completed: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-400",
};

export function TransferRequestsSection() {
  const [siblings, setSiblings] = useState<SiblingBranchDTO[]>([]);
  const [requests, setRequests] = useState<TransferRequestDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fromRestaurantId, setFromRestaurantId] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const siblingNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of siblings) map.set(s.id, s.name);
    return map;
  }, [siblings]);

  function load() {
    Promise.all([
      fetch("/api/admin/inventory/sibling-branches").then((r) => r.json()),
      fetch("/api/admin/inventory/transfer-requests").then((r) => r.json()),
    ])
      .then(([branches, reqs]) => {
        setSiblings(Array.isArray(branches) ? branches : []);
        setRequests(Array.isArray(reqs) ? reqs : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, []);

  // Default the picker to the first sibling once branches load, without
  // triggering a render-cascading setState-in-effect.
  const selectedFromId = fromRestaurantId || siblings[0]?.id || "";

  async function submitRequest() {
    if (!selectedFromId || !ingredientName.trim() || !quantity.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory/transfer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_restaurant_id: selectedFromId,
          ingredient_name: ingredientName,
          unit,
          quantity,
          note: note.trim() || null,
        }),
      });
      if (res.ok) {
        setIngredientName("");
        setQuantity("");
        setNote("");
        load();
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Every request scoped to this branch has exactly one side that matches a
  // sibling branch (the other party) — the side that doesn't resolve to a
  // sibling is this branch itself.
  function describe(request: TransferRequestDTO): { direction: "sent" | "received"; counterpart: string } {
    const fromName = siblingNameById.get(request.from_restaurant_id);
    const toName = siblingNameById.get(request.to_restaurant_id);
    if (toName) return { direction: "sent", counterpart: toName };
    if (fromName) return { direction: "received", counterpart: fromName };
    return { direction: "sent", counterpart: "another branch" };
  }

  return (
    <div className="mt-6 rounded-3xl border border-linen/10 bg-[#221913] p-6">
      <h2 className="font-display text-xl italic text-linen">Transfer Requests</h2>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Request stock from a sibling branch by ingredient name and quantity. A
        Super Admin approves before anything actually moves.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select value={selectedFromId} onChange={(e) => setFromRestaurantId(e.target.value)} className={inputClasses}>
          {siblings.length === 0 && <option value="">No sibling branches</option>}
          {siblings.map((s) => (
            <option key={s.id} value={s.id}>
              From {s.name}
            </option>
          ))}
        </select>
        <input
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          placeholder="Ingredient name"
          className={inputClasses}
        />
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" className={inputClasses} />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (kg, L, pcs)" className={inputClasses} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={inputClasses} />
        <button
          onClick={submitRequest}
          disabled={submitting || !selectedFromId}
          className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50 sm:col-span-2 lg:col-span-1"
        >
          + Request stock
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && requests.length === 0 && <p className="text-sm text-linen/40">No transfer requests yet.</p>}
        {requests.map((r) => {
          const { direction, counterpart } = describe(r);
          return (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linen/10 bg-[#1c1410] p-4"
            >
              <div>
                <p className="font-display text-lg italic text-linen">
                  {r.quantity} {r.unit} {r.ingredient_name}
                </p>
                <p className="text-xs text-linen/50">
                  {direction === "sent" ? `Requested from ${counterpart}` : `Requested by ${counterpart}`}
                  {" · "}
                  {new Date(r.created_at).toLocaleDateString()}
                  {r.note && <span className="ml-2 italic text-linen/40">&ldquo;{r.note}&rdquo;</span>}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  STATUS_BADGE[r.status] ?? "bg-linen/10 text-linen/70"
                }`}
              >
                {r.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
