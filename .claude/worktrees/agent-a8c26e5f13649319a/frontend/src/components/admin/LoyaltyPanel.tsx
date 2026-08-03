"use client";

import { useState } from "react";
import type { LoyaltyAccountDTO } from "@/lib/types";

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

export function LoyaltyPanel() {
  const [phone, setPhone] = useState("");
  const [account, setAccount] = useState<LoyaltyAccountDTO | null | undefined>(undefined);
  const [delta, setDelta] = useState("");
  const [searched, setSearched] = useState(false);

  async function search() {
    if (!phone.trim()) return;
    setSearched(true);
    const res = await fetch(`/api/admin/loyalty/${encodeURIComponent(phone)}`);
    const data = res.ok ? await res.json() : null;
    setAccount(data);
  }

  async function adjust() {
    if (!delta) return;
    const res = await fetch(`/api/admin/loyalty/${encodeURIComponent(phone)}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points_delta: Number(delta) }),
    });
    if (res.ok) {
      setAccount(await res.json());
      setDelta("");
    }
  }

  return (
    <main aria-label="Loyalty">
      <h1 className="font-display text-3xl italic text-linen">Loyalty</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Guests earn points automatically when a bill is paid with their phone
        number attached. Look a guest up here to check their balance or
        adjust it manually.
      </p>

      <div className="mt-8 flex max-w-md gap-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Guest phone number"
          className={`${inputClasses} flex-1`}
        />
        <button
          onClick={search}
          className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02]"
        >
          Look up
        </button>
      </div>

      {searched && (
        <div className="mt-6 max-w-md rounded-3xl border border-linen/10 bg-[#221913] p-6">
          {account === null ? (
            <p className="text-sm text-linen/50">No loyalty account for this number yet — it will be created the first time they pay a bill with it attached.</p>
          ) : account ? (
            <>
              <p className="font-display text-2xl italic text-linen">{account.points} pts</p>
              <p className="mt-1 text-xs text-linen/40">{account.phone}</p>
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  placeholder="+50 or -50"
                  className={`${inputClasses} w-32`}
                />
                <button
                  onClick={adjust}
                  className="rounded-full border border-linen/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-linen transition-colors hover:border-saffron hover:text-saffron"
                >
                  Adjust
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-linen/50">Loading…</p>
          )}
        </div>
      )}
    </main>
  );
}
