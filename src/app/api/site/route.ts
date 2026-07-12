import { NextResponse } from "next/server";
import { getSiteSettings } from "@/server/store";

export const dynamic = "force-dynamic";

/** Public: live site settings (announcement bar, demo branding). */
export async function GET() {
  return NextResponse.json(await getSiteSettings());
}
