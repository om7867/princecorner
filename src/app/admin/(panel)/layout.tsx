import { redirect } from "next/navigation";
import { isAdmin } from "@/server/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#181210]">
      <AdminNav />
      <div className="min-w-0 flex-1 p-5 sm:p-8">{children}</div>
    </div>
  );
}
