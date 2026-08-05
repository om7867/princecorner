"use client";

import { useEffect, useState } from "react";
import type { LoyaltyAccountDTO } from "@/lib/types";

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

const DEFAULT_MOCK_LOYALTY: LoyaltyAccountDTO[] = [
  { id: "l-1", phone: "9876543210", name: "Rahul Sharma", points: 450, created_at: "2026-01-10T10:00:00Z" },
  { id: "l-2", phone: "9825012345", name: "Priya Patel", points: 820, created_at: "2026-01-12T10:00:00Z" },
  { id: "l-3", phone: "9988776655", name: "Amit Shah", points: 190, created_at: "2026-02-01T10:00:00Z" },
  { id: "l-4", phone: "9123456789", name: "Neha Verma", points: 310, created_at: "2026-02-15T10:00:00Z" },
];

export function LoyaltyPanel() {
  const [accounts, setAccounts] = useState<LoyaltyAccountDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [initialPoints, setInitialPoints] = useState("100");
  const [adjustingPhone, setAdjustingPhone] = useState<string | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");

  function loadAccounts() {
    fetch("/api/admin/loyalty")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
        } else {
          setAccounts(DEFAULT_MOCK_LOYALTY);
        }
        setLoaded(true);
      })
      .catch(() => {
        setAccounts(DEFAULT_MOCK_LOYALTY);
        setLoaded(true);
      });
  }

  useEffect(loadAccounts, []);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhone.trim()) return;
    const res = await fetch(`/api/admin/loyalty/${encodeURIComponent(newPhone.trim())}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points_delta: Number(initialPoints) || 0, name: newName.trim() || undefined }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewPhone("");
      setNewName("");
      setInitialPoints("100");
      loadAccounts();
    }
  }

  async function handleAdjustPoints(phone: string) {
    if (!adjustDelta) return;
    const res = await fetch(`/api/admin/loyalty/${encodeURIComponent(phone)}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points_delta: Number(adjustDelta) }),
    });
    if (res.ok) {
      setAdjustingPhone(null);
      setAdjustDelta("");
      loadAccounts();
    }
  }

  async function handleDeleteAccount(phone: string) {
    if (!window.confirm(`Delete loyalty account for ${phone}?`)) return;
    const res = await fetch(`/api/admin/loyalty/${encodeURIComponent(phone)}`, { method: "DELETE" });
    if (res.ok) loadAccounts();
  }

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.phone.includes(searchQuery) || (acc.name && acc.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main aria-label="Loyalty">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl italic text-linen">Loyalty Program</h1>
          <p className="mt-1 max-w-xl text-sm text-linen/50">
            Track member points, reward frequent diners, and adjust point balances manually.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-full bg-saffron px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wider text-espresso transition-transform hover:scale-105"
        >
          ➕ Register Loyalty Member
        </button>
      </div>

      <div className="mt-6 flex max-w-md gap-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by phone number or name..."
          className={`${inputClasses} flex-1`}
        />
      </div>

      {loaded && filteredAccounts.length === 0 && (
        <div className="mt-12 rounded-3xl border border-dashed border-linen/15 p-12 text-center">
          <p className="font-display text-xl italic text-linen/70">No loyalty accounts found</p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((acc) => {
          const tier = acc.points >= 500 ? "Gold 🥇" : acc.points >= 250 ? "Silver 🥈" : "Bronze 🥉";
          return (
            <div key={acc.id} className="rounded-3xl border border-linen/10 bg-[#221913] p-5 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-saffron/15 px-2.5 py-0.5 text-[10px] font-bold text-saffron uppercase tracking-wider">
                    {tier}
                  </span>
                  <h3 className="mt-2 font-display text-xl italic text-linen">{acc.name || "Guest Member"}</h3>
                  <p className="text-xs text-linen/50">📞 {acc.phone}</p>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl font-bold italic text-saffron">{acc.points}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-linen/40">Points</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-linen/10 pt-3">
                {adjustingPhone === acc.phone ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      type="number"
                      value={adjustDelta}
                      onChange={(e) => setAdjustDelta(e.target.value)}
                      placeholder="+50 / -50"
                      className={`${inputClasses} w-24 text-xs`}
                    />
                    <button
                      onClick={() => handleAdjustPoints(acc.phone)}
                      className="rounded-full bg-saffron px-3 py-1.5 text-xs font-bold text-espresso"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setAdjustingPhone(null)}
                      className="text-xs text-linen/40 hover:text-linen"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAdjustingPhone(acc.phone);
                        setAdjustDelta("");
                      }}
                      className="rounded-full border border-linen/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-linen transition-colors hover:border-saffron hover:text-saffron"
                    >
                      Adjust Points
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.phone)}
                      className="text-xs text-linen/40 hover:text-red-400"
                      title="Delete account"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-linen/20 bg-[#1c1510] p-6 text-linen shadow-2xl">
            <h2 className="font-display text-2xl italic text-linen">Register Loyalty Member</h2>

            <form onSubmit={handleCreateAccount} className="mt-4 space-y-3">
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

              <div>
                <label className="block text-xs uppercase tracking-wider text-linen/60">Member Name (optional)</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Priya Patel"
                  className="mt-1 w-full rounded-xl border border-linen/15 bg-espresso/50 px-3 py-2 text-sm text-linen focus:border-saffron focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-linen/60">Welcome Bonus Points</label>
                <input
                  type="number"
                  value={initialPoints}
                  onChange={(e) => setInitialPoints(e.target.value)}
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
                  className="rounded-full bg-saffron px-5 py-2 text-xs font-bold uppercase tracking-wider text-espresso shadow-md hover:scale-105"
                >
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
