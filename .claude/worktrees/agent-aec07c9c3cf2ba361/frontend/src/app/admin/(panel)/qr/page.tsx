import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/env";
import { getSessionToken } from "@/server/auth";
import { QRGrid } from "@/components/admin/QRGrid";
import type { TableDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Table QR Codes — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminQRPage() {
  const token = await getSessionToken();
  const res = await fetch(`${API_BASE_URL}/admin/tables`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const tables: TableDTO[] = res.ok ? await res.json() : [];
  return <QRGrid initialTables={tables} />;
}
