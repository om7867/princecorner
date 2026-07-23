import type { Metadata } from "next";
import { BranchesPanel } from "@/components/admin/BranchesPanel";

export const metadata: Metadata = { title: "Branches — Admin" };

export default function AdminBranchesPage() {
  return <BranchesPanel />;
}
