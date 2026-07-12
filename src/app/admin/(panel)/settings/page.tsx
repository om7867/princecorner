import type { Metadata } from "next";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const metadata: Metadata = { title: "Site & Offers — Admin" };

export default function AdminSettingsPage() {
  return <SettingsEditor />;
}
