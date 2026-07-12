import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkCredentials } from "@/server/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!checkCredentials(body.email ?? "", body.password ?? "")) {
    return NextResponse.json(
      { ok: false, error: "Wrong email or password. Try the demo credentials button." },
      { status: 401 }
    );
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return NextResponse.json({ ok: true });
}
