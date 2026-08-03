import type { Metadata } from "next";
import { OrgAnalyticsDashboard } from "@/components/admin/OrgAnalyticsDashboard";

export const metadata: Metadata = { title: "Organization Analytics — Admin" };

export default function OrgAnalyticsPage() {
  return <OrgAnalyticsDashboard />;
}
