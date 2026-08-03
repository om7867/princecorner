import type { Metadata } from "next";
import { BrandingPanel } from "@/components/admin/BrandingPanel";

export const metadata: Metadata = { title: "Branding — Admin" };

export default function AdminBrandingPage() {
  return <BrandingPanel />;
}
