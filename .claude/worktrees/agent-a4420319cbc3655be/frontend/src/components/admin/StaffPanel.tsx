"use client";

import { useEffect, useState } from "react";

type StaffDTO = {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurant_id: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  branch_name?: string | null;
};

type BranchOption = { id: string; name: string; slug: string };

const ROLE_OPTIONS = ["admin", "manager", "cashier", "kitchen", "waiter"] as const;
type StaffRole = (typeof ROLE_OPTIONS)[number];

const inputClasses =
  "rounded-lg border border-linen/15 bg-espresso/40 px-3 py-2 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";

/**
 * Staff Management. Branch owner/admin/manager see just their own branch's
 * staff (via /admin/staff). Super Admin sees + creates staff across every
 * branch in the org (via /admin/org/staff) and picks a branch per new hire.
 * There's no server-passed role prop here (this is a plain client
 * component), so mode is inferred from which endpoint answers: try the
 * org-wide route first and fall back to the branch-scoped one on a 403.
 */
export function StaffPanel() {
  const [mode, setMode] = useState<"branch" | "org" | null>(null);
  const [staff, setStaff] = useState<StaffDTO[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("waiter");
  const [branchId, setBranchId] = useState("");
  const [saving, setSaving] = useState(false);

  const [resetDrafts, setResetDrafts] = useState<Record<string, string>>({});

  function staffEndpoint(): string {
    return mode === "org" ? "/api/admin/org/staff" : "/api/admin/staff";
  }

  function load() {
    fetch("/api/admin/org/staff")
      .then((orgRes) => {
        if (orgRes.ok) {
          return orgRes.json().then((data) => {
            setMode("org");
            setStaff(Array.isArray(data) ? data : []);
            setLoaded(true);
            fetch("/api/admin/org/branches")
              .then((r) => r.json())
              .then((branchData: BranchOption[]) => {
                if (!Array.isArray(branchData)) return;
                setBranches(branchData);
                setBranchId((cur) => cur || branchData[0]?.id || "");
              })
              .catch(() => {});
          });
        }
        return fetch("/api/admin/staff")
          .then((branchRes) => (branchRes.ok ? branchRes.json() : []))
          .then((data) => {
            setMode("branch");
            setStaff(Array.isArray(data) ? data : []);
            setLoaded(true);
          });
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, []);

  async function addStaff() {
    if (!name.trim() || !email.trim() || !password.trim() || saving) return;
    if (mode === "org" && !branchId) return;
    setSaving(true);
    try {
      const res = await fetch(staffEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          ...(mode === "org" ? { restaurant_id: branchId } : {}),
        }),
      });
      if (res.ok) {
        setName("");
        setEmail("");
        setPassword("");
        setRole("waiter");
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function patchStaff(member: StaffDTO, body: Record<string, unknown>) {
    const res = await fetch(`${staffEndpoint()}/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) load();
    return res.ok;
  }

  function updateRole(member: StaffDTO, newRole: string) {
    if (newRole === member.role) return;
    patchStaff(member, { role: newRole });
  }

  function toggleActive(member: StaffDTO) {
    patchStaff(member, { is_active: !member.is_active });
  }

  async function resetPassword(member: StaffDTO) {
    const draft = resetDrafts[member.id]?.trim();
    if (!draft) return;
    const ok = await patchStaff(member, { password: draft });
    if (ok) setResetDrafts((cur) => ({ ...cur, [member.id]: "" }));
  }

  return (
    <main aria-label="Staff">
      <h1 className="font-display text-3xl italic text-linen">Staff</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        {mode === "org"
          ? "Every branch account across your organization. Add a new account and pick which branch it belongs to."
          : "Manager, cashier, kitchen, and waiter accounts for this branch."}
      </p>

      <div className="mt-8 grid gap-3 rounded-3xl border border-linen/10 bg-[#221913] p-6 sm:grid-cols-2 lg:grid-cols-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputClasses} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClasses}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputClasses}
        />
        <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={inputClasses}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {mode === "org" && (
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className={inputClasses}
            aria-label="Branch for new staff"
          >
            {branches.length === 0 && <option value="">No branches yet</option>}
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={addStaff}
          disabled={saving}
          className="rounded-full bg-saffron px-5 py-2 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          + Add staff
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && staff.length === 0 && <p className="text-sm text-linen/40">No staff accounts yet.</p>}
        {staff.map((member) => (
          <div
            key={member.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linen/10 bg-[#221913] p-4"
          >
            <div className="min-w-[10rem]">
              <p className="font-display text-lg italic text-linen">{member.name}</p>
              <p className="text-xs text-linen/50">
                {member.email}
                {mode === "org" && member.branch_name ? ` · ${member.branch_name}` : ""}
              </p>
              {member.last_login_at && (
                <p className="text-[11px] text-linen/30">
                  Last login {new Date(member.last_login_at).toLocaleString()}
                </p>
              )}
            </div>

            <select
              value={member.role}
              onChange={(e) => updateRole(member, e.target.value)}
              className={`${inputClasses} w-32`}
              aria-label={`Role for ${member.name}`}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button
              onClick={() => toggleActive(member)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                member.is_active ? "bg-sage/15 text-sage" : "bg-linen/10 text-linen/50"
              }`}
            >
              {member.is_active ? "Active" : "Disabled"}
            </button>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={resetDrafts[member.id] ?? ""}
                onChange={(e) => setResetDrafts((cur) => ({ ...cur, [member.id]: e.target.value }))}
                placeholder="New password"
                className={`${inputClasses} w-32`}
                aria-label={`Reset password for ${member.name}`}
              />
              <button
                onClick={() => resetPassword(member)}
                className="rounded-full border border-linen/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-linen transition-colors hover:border-saffron hover:text-saffron"
              >
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
