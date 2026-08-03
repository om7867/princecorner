import type { Metadata } from "next";
import { LoyaltyPanel } from "@/components/admin/LoyaltyPanel";

export const metadata: Metadata = { title: "Loyalty — Admin" };

export default function AdminLoyaltyPage() {
  return <LoyaltyPanel />;
}
