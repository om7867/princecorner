"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { Session } from "@/server/auth";

type BranchOption = { id: string; name: string; slug: string };

const ALL_LINKS = [
  { href: "/admin", label: "Live Orders", icon: "🔔", roles: null },
  { href: "/admin/menu", label: "Menu Editor", icon: "🍽", roles: ["owner", "admin", "manager", "super_admin"] },
  { href: "/admin/settings", label: "Site & Offers", icon: "📣", roles: ["owner", "admin", "super_admin"] },
  { href: "/admin/pages", label: "Pages", icon: "🌐", roles: ["owner", "admin", "super_admin"] },
  { href: "/admin/qr", label: "Table QR Codes", icon: "▦", roles: ["owner", "admin", "manager", "super_admin"] },
  {
    href: "/admin/reservations",
    label: "Reservations",
    icon: "📅",
    roles: ["owner", "admin", "manager", "cashier", "super_admin"],
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: "💳",
    roles: ["owner", "admin", "manager", "cashier", "super_admin"],
  },
  { href: "/admin/coupons", label: "Coupons", icon: "🎟", roles: ["owner", "admin", "manager", "super_admin"] },
  {
    href: "/admin/loyalty",
    label: "Loyalty",
    icon: "⭐",
    roles: ["owner", "admin", "manager", "cashier", "super_admin"],
  },
  { href: "/admin/inventory", label: "Inventory", icon: "📦", roles: ["owner", "admin", "manager", "super_admin"] },
  { href: "/admin/analytics", label: "Analytics", icon: "📊", roles: ["owner", "admin", "manager", "super_admin"] },
  { href: "/admin/staff", label: "Staff", icon: "👥", roles: ["owner", "admin", "super_admin"] },
] as const;

export function AdminNav({ role }: { role: Session["role"] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSiteSettings();
  const isSuperAdmin = role === "super_admin";

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    fetch("/api/admin/org/branches")
      .then((r) => r.json())
      .then((data: BranchOption[]) => {
        if (cancelled || !Array.isArray(data)) return;
        setBranches(data);
        setSelectedBranchId((cur) => cur || data[0]?.id || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  async function switchBranch(branchId: string) {
    setSelectedBranchId(branchId);
    await fetch("/api/admin/select-branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch_id: branchId }),
    });
    window.location.reload();
  }

  const links: { href: string; label: string; icon: string }[] = ALL_LINKS.filter(
    (link) => !link.roles || (link.roles as readonly string[]).includes(role)
  );
  if (isSuperAdmin) {
    links.push(
      { href: "/admin/branches", label: "Branches", icon: "🏢" },
      { href: "/admin/global-menu", label: "Global Menu", icon: "🌍" },
      { href: "/admin/global-coupons", label: "Global Coupons", icon: "🎫" },
      { href: "/admin/org-inventory-transfers", label: "Transfers", icon: "🚚" },
      { href: "/admin/org-analytics", label: "Org Analytics", icon: "📈" },
      { href: "/admin/branding", label: "Branding", icon: "🎨" }
    );
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const name = settings?.name ?? "";

  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-linen/10 bg-[#120d0a] sm:w-56">
      <div className="border-b border-linen/10 p-4">
        <p className="hidden font-display text-xl italic text-linen sm:block">{name} Admin</p>
        <p className="text-center font-display text-xl italic text-linen sm:hidden">
          {name.charAt(0) || "•"}
        </p>
        {isSuperAdmin && branches.length > 0 && (
          <select
            aria-label="Switch branch"
            value={selectedBranchId}
            onChange={(e) => switchBranch(e.target.value)}
            className="mt-3 hidden w-full rounded-lg border border-linen/15 bg-espresso/40 px-2 py-1.5 text-xs text-linen focus:border-saffron focus:outline-none sm:block"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <nav aria-label="Admin" className="flex-1 p-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-colors ${
                isActive
                  ? "bg-saffron text-espresso"
                  : "text-linen/70 hover:bg-linen/5 hover:text-linen"
              }`}
            >
              <span aria-hidden className="text-base">{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-linen/10 p-2">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-linen/70 transition-colors hover:bg-linen/5 hover:text-linen"
        >
          <span aria-hidden>↗</span>
          <span className="hidden sm:inline">View website</span>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-linen/70 transition-colors hover:bg-linen/5 hover:text-linen"
        >
          <span aria-hidden>⎋</span>
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </aside>
  );
}
