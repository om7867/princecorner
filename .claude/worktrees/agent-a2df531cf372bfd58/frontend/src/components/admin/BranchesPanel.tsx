"use client";

import { useEffect, useState } from "react";

type BranchDTO = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BranchesPanel() {
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    const query = showArchived ? "?include_archived=true" : "";
    fetch(`/api/admin/org/branches${query}`)
      .then((r) => r.json())
      .then((data) => {
        setBranches(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, [showArchived]);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  async function addBranch() {
    if (!name.trim() || !slug.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/org/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (res.ok) {
        setName("");
        setSlug("");
        setSlugTouched(false);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't create branch.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function renameBranch(branch: BranchDTO, field: "name" | "slug", value: string) {
    if (value === branch[field]) return;
    const res = await fetch(`/api/admin/org/branches/${branch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) load();
  }

  async function setActive(branch: BranchDTO, isActive: boolean) {
    setError(null);
    const res = await fetch(`/api/admin/org/branches/${branch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });
    if (res.ok) {
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't update branch.");
    }
  }

  return (
    <main aria-label="Branches">
      <h1 className="font-display text-3xl italic text-linen">Branches</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Every branch in your organization. Add a new branch, then use the
        switcher in the sidebar to manage its menu, orders, and settings.
      </p>

      <div className="mt-8 grid gap-3 rounded-3xl border border-linen/10 bg-[#221913] p-6 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Branch name"
          className={inputClasses}
        />
        <input
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="branch-slug"
          className={inputClasses}
        />
        <button
          onClick={addBranch}
          disabled={saving}
          className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          + Add branch
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-saffron">
          {error}
        </p>
      )}

      <label className="mt-6 flex items-center gap-2 text-xs text-linen/50">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="accent-saffron"
        />
        Show archived
      </label>

      <div className="mt-3 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && branches.length === 0 && <p className="text-sm text-linen/40">No branches yet.</p>}
        {branches.map((b) => (
          <div
            key={b.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linen/10 bg-[#221913] p-4 ${
              !b.is_active ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                defaultValue={b.name}
                onBlur={(e) => renameBranch(b, "name", e.target.value)}
                disabled={!b.is_active}
                className={`${inputClasses} w-48`}
                aria-label={`Name for ${b.name}`}
              />
              <input
                defaultValue={b.slug}
                onBlur={(e) => renameBranch(b, "slug", e.target.value)}
                disabled={!b.is_active}
                className={`${inputClasses} w-40`}
                aria-label={`Slug for ${b.name}`}
              />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-linen/40">
                Created {new Date(b.created_at).toLocaleDateString()}
              </p>
              {b.is_active ? (
                <button
                  onClick={() => setActive(b, false)}
                  className="rounded-full bg-linen/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-linen/70 transition-colors hover:bg-red-500/15 hover:text-red-400"
                >
                  Archive
                </button>
              ) : (
                <button
                  onClick={() => setActive(b, true)}
                  className="rounded-full bg-sage/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-sage transition-colors hover:bg-sage/25"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
