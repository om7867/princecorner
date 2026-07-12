import type { Metadata } from "next";
import { getTables } from "@/server/store";
import { QRGrid } from "@/components/admin/QRGrid";

export const metadata: Metadata = { title: "Table QR Codes — Admin" };

export default async function AdminQRPage() {
  const tables = await getTables();
  return <QRGrid tables={tables} />;
}
