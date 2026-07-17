import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderApp } from "./OrderApp";

export const metadata: Metadata = {
  title: "Order at Your Table",
  description: "Scan, order, and track your food — no app, no queue.",
  // Per-table QR destination with query params — not a search result.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderApp />
    </Suspense>
  );
}
