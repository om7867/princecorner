import type { Metadata } from "next";
import { PaymentsPanel } from "@/components/admin/PaymentsPanel";

export const metadata: Metadata = { title: "Payments — Admin" };

export default function AdminPaymentsPage() {
  return <PaymentsPanel />;
}
