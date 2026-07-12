"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Live Orders", icon: "🔔" },
  { href: "/admin/menu", label: "Menu Editor", icon: "🍽" },
  { href: "/admin/settings", label: "Site & Offers", icon: "📣" },
  { href: "/admin/qr", label: "Table QR Codes", icon: "▦" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-linen/10 bg-[#120d0a] sm:w-56">
      <div className="border-b border-linen/10 p-4">
        <p className="hidden text-[10px] uppercase tracking-[0.25em] text-saffron sm:block">
          KelvionTech presents
        </p>
        <p className="hidden font-display text-xl italic text-linen sm:block">
          Smaplee Admin
        </p>
        <p className="text-center font-display text-xl italic text-linen sm:hidden">S</p>
      </div>

      <nav aria-label="Admin" className="flex-1 p-2">
        {LINKS.map((link) => {
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
