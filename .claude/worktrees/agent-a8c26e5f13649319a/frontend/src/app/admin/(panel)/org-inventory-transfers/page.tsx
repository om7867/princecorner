import type { Metadata } from "next";
import { OrgInventoryTransfersPanel } from "@/components/admin/OrgInventoryTransfersPanel";

export const metadata: Metadata = { title: "Inventory Transfers — Admin" };

export default function AdminOrgInventoryTransfersPage() {
  return <OrgInventoryTransfersPanel />;
}
