import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { branch_id } = await request.json().catch(() => ({ branch_id: null }));
  if (!branch_id) return NextResponse.json({ ok: false, error: "branch_id required" }, { status: 400 });
  (await cookies()).set("selected_branch_id", branch_id, { path: "/", sameSite: "lax" });
  return NextResponse.json({ ok: true });
}
