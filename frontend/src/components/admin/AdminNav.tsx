"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { Session } from "@/server/auth";

const ALL_LINKS = [
  { href: "/admin", label: "Live Orders", icon: "🔔", roles: null },
  { href: "/admin/menu", label: "Menu Editor", icon: "🍽", roles: ["owner", "admin", "manager"] },
  { href: "/admin/settings", label: "Site & Offers", icon: "📣", roles: ["owner", "admin"] },
  { href: "/admin/qr", label: "Table QR Codes", icon: "▦", roles: ["owner", "admin", "manager"] },
  { href: "/admin/reservations", label: "Reservations", icon: "📅", roles: ["owner", "admin", "manager", "cashier"] },
  { href: "/admin/payments", label: "Payments", icon: "💳", roles: ["owner", "admin", "manager", "cashier"] },
  { href: "/admin/coupons", label: "Coupons", icon: "🎟", roles: ["owner", "admin", "manager"] },
  { href: "/admin/loyalty", label: "Loyalty", icon: "⭐", roles: ["owner", "admin", "manager", "cashier"] },
  { href: "/admin/inventory", label: "Inventory", icon: "📦", roles: ["owner", "admin", "manager"] },
  { href: "/admin/analytics", label: "Analytics", icon: "📊", roles: ["owner", "admin", "manager"] },
] as const;

export function AdminNav({ role }: { role: Session["role"] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSiteSettings();

  const links = ALL_LINKS.filter((link) => !link.roles || (link.roles as readonly string[]).includes(role));

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
