import { NextResponse } from "next/server";
import { getAvailableMenu } from "@/server/store";

export const dynamic = "force-dynamic";

/** Public: menu as guests see it (86'd items excluded). */
export async function GET() {
  return NextResponse.json({ items: await getAvailableMenu() });
}
