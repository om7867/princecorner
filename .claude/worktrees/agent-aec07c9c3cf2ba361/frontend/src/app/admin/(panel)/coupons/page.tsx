import type { Metadata } from "next";
import { CouponsPanel } from "@/components/admin/CouponsPanel";

export const metadata: Metadata = { title: "Coupons — Admin" };

export default function AdminCouponsPage() {
  return <CouponsPanel />;
}
