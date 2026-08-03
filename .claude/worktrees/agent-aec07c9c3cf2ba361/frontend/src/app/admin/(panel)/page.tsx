import type { Metadata } from "next";
import { OrdersBoard } from "@/components/admin/OrdersBoard";
import { getSession } from "@/server/auth";

export const metadata: Metadata = { title: "Live Orders — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  const heading = session?.role === "kitchen" ? "Kitchen Display" : "Live Orders";
  return <OrdersBoard heading={heading} />;
}
