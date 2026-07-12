"use client";

import { usePathname } from "next/navigation";
import { SiteNavbar } from "./SiteNavbar";
import { FloatingContact } from "./FloatingContact";

/**
 * Marketing-site chrome (navbar, WhatsApp/call buttons). Hidden on the
 * guest ordering flow and the admin panel — those are focused app surfaces
 * with their own headers.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname.startsWith("/order") || pathname.startsWith("/admin");

  if (bare) return <>{children}</>;

  return (
    <>
      <SiteNavbar />
      {children}
      <FloatingContact />
    </>
  );
}
