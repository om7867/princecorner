import type { Metadata } from "next";
import { GlobalMenuPanel } from "@/components/admin/GlobalMenuPanel";

export const metadata: Metadata = { title: "Global Menu — Admin" };

export default function AdminGlobalMenuPage() {
  return <GlobalMenuPanel />;
}
