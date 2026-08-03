"use client";

import { useEffect, useState } from "react";

type BrandingDTO = {
  brand_logo_url: string | null;
  brand_primary_color: string | null;
  brand_accent_color: string | null;
};

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";
const labelClasses = "block text-xs font-medium uppercase tracking-[0.15em] text-linen/60";

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function BrandingPanel() {
  const [branding, setBranding] = useState<BrandingDTO | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/org/branding")
      .then((r) => r.json())
      .then(setBranding)
      .catch(() => {});
  }

  useEffect(load, []);

  async function patch(field: keyof BrandingDTO, value: string) {
    if (!branding || value === (branding[field] ?? "")) return;
    setError(null);
    const res = await fetch("/api/admin/org/branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    if (res.ok) {
      const data = await res.json();
      setBranding(data);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't save branding.");
    }
  }

  async function pushToAllBranches() {
    setPushing(true);
    setPushMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/org/branding/push", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPushMessage(`Updated ${data.branches_updated} ${data.branches_updated === 1 ? "branch" : "branches"}.`);
      } else {
        setError(data.error ?? "Couldn't push branding.");
      }
    } finally {
      setPushing(false);
    }
  }

  if (!branding) {
    return <div className="h-64 animate-pulse rounded-3xl bg-linen/5" aria-hidden />;
  }

  return (
    <main aria-label="Branding">
      <h1 className="font-display text-3xl italic text-linen">Branding</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Set the organization-wide default logo and colors, then push them out
        to reset every active branch&rsquo;s site back to these defaults.
      </p>

      <div className="mt-8 max-w-xl space-y-5 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <div>
          <label htmlFor="brand-logo" className={labelClasses}>
            Logo URL
          </label>
          <input
            id="brand-logo"
            defaultValue={branding.brand_logo_url ?? ""}
            onBlur={(e) => patch("brand_logo_url", e.target.value)}
            placeholder="https://example.com/logo.png"
            className={`${inputClasses} mt-1 w-full`}
          />
        </div>

        <div>
          <label htmlFor="brand-primary" className={labelClasses}>
            Primary color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="brand-primary"
              type="color"
              defaultValue={isValidHex(branding.brand_primary_color ?? "") ? (branding.brand_primary_color as string) : "#e7a73a"}
              onBlur={(e) => patch("brand_primary_color", e.target.value)}
              className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-linen/15 bg-espresso/40"
              aria-label="Primary color picker"
            />
            <input
              defaultValue={branding.brand_primary_color ?? ""}
              onBlur={(e) => patch("brand_primary_color", e.target.value)}
              placeholder="#e7a73a"
              className={`${inputClasses} flex-1`}
              aria-label="Primary color hex"
            />
          </div>
        </div>

        <div>
          <label htmlFor="brand-accent" className={labelClasses}>
            Accent color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="brand-accent"
              type="color"
              defaultValue={isValidHex(branding.brand_accent_color ?? "") ? (branding.brand_accent_color as string) : "#6b7a4f"}
              onBlur={(e) => patch("brand_accent_color", e.target.value)}
              className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-linen/15 bg-espresso/40"
              aria-label="Accent color picker"
            />
            <input
              defaultValue={branding.brand_accent_color ?? ""}
              onBlur={(e) => patch("brand_accent_color", e.target.value)}
              placeholder="#6b7a4f"
              className={`${inputClasses} flex-1`}
              aria-label="Accent color hex"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-saffron">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-linen/10 pt-5">
          <button
            onClick={pushToAllBranches}
            disabled={pushing}
            className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
          >
            {pushing ? "Pushing…" : "Push to all branches"}
          </button>
          {pushMessage && <p className="text-sm text-sage">{pushMessage}</p>}
        </div>
      </div>
    </main>
  );
}
