import type { Metadata } from "next";
import { OrdersBoard } from "@/components/admin/OrdersBoard";

export const metadata: Metadata = { title: "Live Orders — Admin" };

export default function AdminOrdersPage() {
  return <OrdersBoard />;
}
