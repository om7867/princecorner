import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { PlatformNav } from "@/components/platform/PlatformNav";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "platform_owner") redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#181210]">
      <PlatformNav />
      <div className="min-w-0 flex-1 p-5 sm:p-8">{children}</div>
    </div>
  );
}
