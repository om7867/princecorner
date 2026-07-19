import type { Metadata } from "next";
import { InventoryPanel } from "@/components/admin/InventoryPanel";

export const metadata: Metadata = { title: "Inventory — Admin" };

export default function AdminInventoryPage() {
  return <InventoryPanel />;
}
