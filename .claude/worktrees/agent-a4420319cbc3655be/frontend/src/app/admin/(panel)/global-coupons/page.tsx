import type { Metadata } from "next";
import { GlobalCouponsPanel } from "@/components/admin/GlobalCouponsPanel";

export const metadata: Metadata = { title: "Global Coupons — Admin" };

export default function AdminGlobalCouponsPage() {
  return <GlobalCouponsPanel />;
}
