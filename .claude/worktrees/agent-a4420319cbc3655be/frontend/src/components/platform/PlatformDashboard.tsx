"use client";

import { useEffect, useState } from "react";
import type { OrganizationDTO, OrganizationPlan, OrganizationStatus } from "@/lib/types";

const inputClasses =
  "mt-1 w-full rounded-xl border border-linen/15 bg-espresso/40 px-4 py-3 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";
const labelClasses = "block text-xs font-medium uppercase tracking-[0.15em] text-linen/60";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const STATUS_BADGE: Record<OrganizationStatus, string> = {
  trial: "bg-saffron/15 text-saffron",
  active: "bg-sage/15 text-sage",
  suspended: "bg-red-500/15 text-red-400",
};

const PLAN_OPTIONS: OrganizationPlan[] = ["trial", "starter", "pro", "enterprise"];

function closureBadge(accessEndsAt: string | null): { text: string; className: string } | null {
  if (!accessEndsAt) return null;
  const ends = new Date(accessEndsAt);
  const ended = ends.getTime() <= Date.now();
  return ended
    ? { text: "Access ended", className: "bg-red-500/15 text-red-400" }
    : {
        text: `Closes ${ends.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
        className: "bg-saffron/15 text-saffron",
      };
}

export function PlatformDashboard() {
  const [orgs, setOrgs] = useState<OrganizationDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgSlugTouched, setOrgSlugTouched] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchSlug, setBranchSlug] = useState("");
  const [branchSlugTouched, setBranchSlugTouched] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  function load() {
    fetch("/api/platform/organizations")
      .then((r) => r.json())
      .then((data) => {
        setOrgs(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(load, []);

  function resetForm() {
    setOrgName("");
    setOrgSlug("");
    setOrgSlugTouched(false);
    setBranchName("");
    setBranchSlug("");
    setBranchSlugTouched(false);
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
  }

  async function createOrganization() {
    if (!orgName.trim() || !orgSlug.trim() || !branchName.trim() || !branchSlug.trim()) return;
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: orgName,
          org_slug: orgSlug,
          branch_name: branchName,
          branch_slug: branchSlug,
          super_admin_name: adminName,
          super_admin_email: adminEmail,
          super_admin_password: adminPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok !== false) {
        setOrgs((prev) => [data, ...prev]);
        resetForm();
      } else {
        setError(data.error ?? "Couldn't create organization.");
      }
    } catch {
      setError("Couldn't reach the server — try again.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(org: OrganizationDTO) {
    const nextStatus: OrganizationStatus = org.status === "suspended" ? "active" : "suspended";
    const res = await fetch(`/api/platform/organizations/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrgs((prev) => prev.map((o) => (o.id === org.id ? data : o)));
    }
  }

  async function changePlan(org: OrganizationDTO, plan: OrganizationPlan) {
    const res = await fetch(`/api/platform/organizations/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrgs((prev) => prev.map((o) => (o.id === org.id ? data : o)));
    }
  }

  async function setClosureDate(org: OrganizationDTO, dateValue: string) {
    // dateValue is "" (cleared) or "YYYY-MM-DD" from <input type="date">.
    const access_ends_at = dateValue ? new Date(`${dateValue}T23:59:59`).toISOString() : null;
    const res = await fetch(`/api/platform/organizations/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_ends_at }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrgs((prev) => prev.map((o) => (o.id === org.id ? data : o)));
    }
  }

  return (
    <main aria-label="Organizations">
      <h1 className="font-display text-3xl italic text-linen">Organizations</h1>
      <p className="mt-1 max-w-xl text-sm text-linen/50">
        Create and manage every organization on the platform — each one gets
        its first branch and a super admin account.
      </p>

      <div className="mt-8 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <h2 className="font-display text-xl italic text-linen">+ New organization</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="p-org-name" className={labelClasses}>
              Organization name
            </label>
            <input
              id="p-org-name"
              value={orgName}
              onChange={(e) => {
                const value = e.target.value;
                setOrgName(value);
                if (!orgSlugTouched) setOrgSlug(slugify(value));
              }}
              className={inputClasses}
              placeholder="Sunrise Hospitality Group"
            />
          </div>
          <div>
            <label htmlFor="p-org-slug" className={labelClasses}>
              Organization slug
            </label>
            <input
              id="p-org-slug"
              value={orgSlug}
              onChange={(e) => {
                setOrgSlugTouched(true);
                setOrgSlug(slugify(e.target.value));
              }}
              className={inputClasses}
              placeholder="sunrise-hospitality-group"
            />
          </div>
          <div>
            <label htmlFor="p-branch-name" className={labelClasses}>
              First branch name
            </label>
            <input
              id="p-branch-name"
              value={branchName}
              onChange={(e) => {
                const value = e.target.value;
                setBranchName(value);
                if (!branchSlugTouched) setBranchSlug(slugify(value));
              }}
              className={inputClasses}
              placeholder="Downtown"
            />
          </div>
          <div>
            <label htmlFor="p-branch-slug" className={labelClasses}>
              First branch slug
            </label>
            <input
              id="p-branch-slug"
              value={branchSlug}
              onChange={(e) => {
                setBranchSlugTouched(true);
                setBranchSlug(slugify(e.target.value));
              }}
              className={inputClasses}
              placeholder="downtown"
            />
          </div>
          <div>
            <label htmlFor="p-admin-name" className={labelClasses}>
              Super admin name
            </label>
            <input
              id="p-admin-name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className={inputClasses}
              placeholder="Priya Sharma"
            />
          </div>
          <div>
            <label htmlFor="p-admin-email" className={labelClasses}>
              Super admin email
            </label>
            <input
              id="p-admin-email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className={inputClasses}
              placeholder="priya@sunrise.com"
            />
          </div>
          <div>
            <label htmlFor="p-admin-password" className={labelClasses}>
              Super admin password
            </label>
            <input
              id="p-admin-password"
              type="password"
              autoComplete="new-password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-saffron">
            {error}
          </p>
        )}

        <button
          onClick={createOrganization}
          disabled={creating}
          className="mt-6 rounded-full bg-saffron px-6 py-2.5 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
        >
          {creating ? "Creating…" : "+ New organization"}
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {!loaded && <div className="h-16 animate-pulse rounded-2xl bg-linen/5" aria-hidden />}
        {loaded && orgs.length === 0 && <p className="text-sm text-linen/40">No organizations yet.</p>}
        {orgs.map((org) => {
          const badge = closureBadge(org.access_ends_at);
          return (
            <div key={org.id} className="rounded-2xl border border-linen/10 bg-[#221913] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg italic text-linen">{org.name}</p>
                  <p className="text-xs text-linen/50">
                    /{org.slug}
                    {" · "}
                    {org.branch_count} {org.branch_count === 1 ? "branch" : "branches"}
                    {" · created "}
                    {org.created_at.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Plan for ${org.name}`}
                    value={org.plan}
                    onChange={(e) => changePlan(org, e.target.value as OrganizationPlan)}
                    className="rounded-full border border-linen/15 bg-espresso/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-linen focus:border-saffron focus:outline-none"
                  >
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${STATUS_BADGE[org.status]}`}
                  >
                    {org.status}
                  </span>
                  <button
                    onClick={() => toggleStatus(org)}
                    className="rounded-full bg-linen/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-linen/70 transition-colors hover:bg-linen/15 hover:text-linen"
                  >
                    {org.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-linen/10 pt-3">
                <label htmlFor={`closure-${org.id}`} className="text-xs font-medium uppercase tracking-[0.1em] text-linen/50">
                  Closes on
                </label>
                <input
                  id={`closure-${org.id}`}
                  type="date"
                  defaultValue={org.access_ends_at ? org.access_ends_at.slice(0, 10) : ""}
                  onBlur={(e) => setClosureDate(org, e.target.value)}
                  className="rounded-lg border border-linen/15 bg-espresso/40 px-3 py-1.5 text-xs text-linen focus:border-saffron focus:outline-none"
                />
                {badge && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${badge.className}`}>
                    {badge.text}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
