import type { Metadata } from "next";
import { PagesPanel } from "@/components/admin/PagesPanel";

export const metadata: Metadata = { title: "Pages — Admin" };

export default function AdminPagesPage() {
  return <PagesPanel />;
}
