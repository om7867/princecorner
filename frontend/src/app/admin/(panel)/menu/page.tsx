import type { Metadata } from "next";
import { MenuEditor } from "@/components/admin/MenuEditor";

export const metadata: Metadata = { title: "Menu Editor — Admin" };

export default function AdminMenuPage() {
  return <MenuEditor />;
}
